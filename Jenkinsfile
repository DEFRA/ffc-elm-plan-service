@Library('defra-library@3.0.1')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def containerSrcFolder = '\\/home\\/node'
def containerTag = ''
def dockerTestService = 'app'
def lcovFile = './test-output/lcov.info'
def localSrcFolder = '.'
def mergedPrNo = ''
def pr = ''
def serviceName = 'ffc-elm-plan-service'
def serviceNamespace = 'ffc-elm'
def sonarQubeEnv = 'SonarQube'
def sonarScanner = 'SonarScanner'
def timeoutInMinutes = 5

node {
  checkout scm
  try {
    stage('Set GitHub status as pending'){
      defraUtils.setGithubStatusPending()
    }
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(serviceName, defraUtils.getPackageJsonVersion())
    }
    stage('Helm lint') {
      defraUtils.lintHelm(serviceName)
    }
    stage('Build test image') {
      defraUtils.buildTestImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, BUILD_NUMBER)
    }
    stage('Run tests') {
      defraUtils.runTests(serviceName, dockerTestService, BUILD_NUMBER)
    }
    stage('Create Test Report JUnit'){
      defraUtils.createTestReportJUnit()
    }
    stage('Fix absolute paths in lcov file') {
      defraUtils.replaceInFile(containerSrcFolder, localSrcFolder, lcovFile)
    }
    stage('SonarQube analysis') {
      defraUtils.analyseCode(sonarQubeEnv, sonarScanner, ['sonar.projectKey' : serviceName, 'sonar.sources' : '.'])
    }
    stage("Code quality gate") {
      defraUtils.waitForQualityGateResult(timeoutInMinutes)
    }
    stage('Push container image') {
      defraUtils.buildAndPushContainerImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, containerTag)
    }
    if (pr != '') {
      stage('Verify version incremented') {
        defraUtils.verifyPackageJsonVersionIncremented()
      }
      stage('Helm install') {
        withCredentials([
          string(credentialsId: 'sqs-queue-endpoint', variable: 'planQueueEndpoint'),
          string(credentialsId: 'plan-queue-url-pr', variable: 'planQueueUrl'),
          string(credentialsId: 'plan-queue-access-key-id-send', variable: 'planQueueAccessKeyId'),
          string(credentialsId: 'plan-queue-secret-access-key-send', variable: 'planQueueSecretAccessKey'),
          string(credentialsId: 'postgres-external-name-pr', variable: 'postgresExternalName'),
          usernamePassword(credentialsId: 'ffc-elm-plan-service-postgres-user-pr', usernameVariable: 'postgresUsername', passwordVariable: 'postgresPassword'),
        ]) {
          def helmValues = [
            /container.planQueueEndpoint="$planQueueEndpoint"/,
            /container.planQueueUrl="$planQueueUrl"/,
            /container.planCreateQueue="false"/,
            /container.redeployOnChange="$pr-$BUILD_NUMBER"/,
            /postgresExternalName="$postgresExternalName"/,
            /postgresPassword="$postgresPassword"/,
            /postgresUsername="$postgresUsername"/,
            /labels.version="$containerTag"/
          ].join(',')

          def extraCommands = [
            "--values ./helm/ffc-elm-plan-service/jenkins-aws.yaml",
            "--set $helmValues"
          ].join(' ')

          defraUtils.deployChart(KUBE_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, containerTag, extraCommands)
        }
      }
    }
    if (pr == '') {
      stage('Publish chart') {
        defraUtils.publishChart(DOCKER_REGISTRY, serviceName, containerTag)
      }
      stage('Trigger GitHub release') {
        withCredentials([
          string(credentialsId: 'github-auth-token', variable: 'gitToken')
        ]) {
          defraUtils.triggerRelease(containerTag, serviceName, containerTag, gitToken)
        }
      }
      stage('Deploy master') {
        def helmValues = [
          /container.redeployOnChange="$BUILD_NUMBER"/
        ].join(',')

        def extraCommands = [
          "--set $helmValues"
        ].join(' ')

        defraUtils.deployRemoteChart(serviceNamespace, serviceName, containerTag, extraCommands)
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(KUBE_CREDENTIALS_ID, serviceName, mergedPrNo)
      }
    }
    stage('Set GitHub status as success'){
      defraUtils.setGithubStatusSuccess()
    }
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    defraUtils.notifySlackBuildFailure(e.message, "#generalbuildfailures")
    throw e
  } finally {
    defraUtils.deleteTestOutput(serviceName, containerSrcFolder)
  }
}
