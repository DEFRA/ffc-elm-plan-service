@Library('defra-library@3.0.1')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def containerSrcFolder = '\\/home\\/node'
def containerTag = ''
def cscServiceCode = 'ELM'
def cscServiceName = 'ELM'
def cscServiceType = 'Environmental Land Management'
def dockerTestService = 'app'
def lcovFile = './test-output/lcov.info'
def localSrcFolder = '.'
def mergedPrNo = ''
def planCommandQueueName = 'devffc-elm-plan-command-prod'
def pr = ''
def prPlanCommandQueueName = 'devffc-elm-plan-command-test'
def prPostgresDatabaseName = 'ffc_elm_plan'
def prPostgresExternalNameCredId = 'ffc-elm-postgres-external-name-pr'
def prPostgresUserCredId = 'ffc-elm-plan-service-postgres-user-jenkins'
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
        // Remove version increment check for initial version - the check fails if no previous version exists
        // defraUtils.verifyPackageJsonVersionIncremented()
      }
      stage('Provision PR infrastructure') {
        defraUtils.provisionPrDatabaseRoleAndSchema(prPostgresExternalNameCredId, prPostgresDatabaseName, prPostgresUserCredId, 'ffc-elm-plan-service-postgres-user-pr', pr, true)
      }
      stage('Helm install') {
        withCredentials([
          string(credentialsId: 'ffc-elm-sqs-plan-command-queue-endpoint-pr', variable: 'planCommandQueueEndpoint'),
          string(credentialsId: 'ffc-elm-sqs-plan-command-access-key-id-write', variable: 'planCommandQueueAccessKeyId'),
          string(credentialsId: 'ffc-elm-sqs-plan-command-access-key-write', variable: 'planCommandQueueSecretAccessKey'),
          string(credentialsId: prPostgresExternalNameCredId, variable: 'postgresExternalName'),
          usernamePassword(credentialsId: prPostgresUserCredId, usernameVariable: 'postgresUsername', passwordVariable: 'postgresPassword')
        ]) {
          def helmValues = [
            /container.redeployOnChange="${pr}-${BUILD_NUMBER}"/,
            /labels.version="${containerTag}"/,
            /postgres.externalName="${postgresExternalName}"/,
            /postgres.password="${postgresPassword}"/,
            /postgres.username="${postgresUsername}"/,
            /queues.planCommandQueue.accessKeyId="${planCommandQueueAccessKeyId}"/,
            /queues.planCommandQueue.create="false"/,
            /queues.planCommandQueue.endpoint="${planCommandQueueEndpoint}"/,
            /queues.planCommandQueue.name="${serviceName}-pr${pr}-${prPlanCommandQueueName}"/,
            /queues.planCommandQueue.secretAccessKey="${planCommandQueueSecretAccessKey}"/,
            /queues.planCommandQueue.url="${planCommandQueueEndpoint}\/${prPlanCommandQueueName}"/
          ].join(',')

          def extraCommands = [
            "--set ${helmValues}"
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
        withCredentials([
          string(credentialsId: 'ffc-elm-sqs-plan-command-queue-endpoint-master', variable: 'planCommandQueueEndpoint'),
          string(credentialsId: 'ffc-elm-sqs-plan-command-access-key-id-write', variable: 'planCommandQueueAccessKeyId'),
          string(credentialsId: 'ffc-elm-sqs-plan-command-access-key-write', variable: 'planCommandQueueSecretAccessKey'),
          string(credentialsId: 'ffc-elm-postgres-external-name-master', variable: 'postgresExternalName'),
          usernamePassword(credentialsId: 'ffc-elm-plan-service-postgres-user-master', usernameVariable: 'postgresUsername', passwordVariable: 'postgresPassword'),
        ]) {
          def helmValues = [
            /container.redeployOnChange="${BUILD_NUMBER}"/,
            /labels.version="${containerTag}"/,
            /postgres.externalName="${postgresExternalName}"/,
            /postgres.password="${postgresPassword}"/,
            /postgres.username="${postgresUsername}"/,
            /queues.planCommandQueue.accessKeyId="${planCommandQueueAccessKeyId}"/,
            /queues.planCommandQueue.create="false"/,
            /queues.planCommandQueue.endpoint="${planCommandQueueEndpoint}"/,
            /queues.planCommandQueue.name="${planCommandQueueName}"/,
            /queues.planCommandQueue.secretAccessKey="${planCommandQueueSecretAccessKey}"/,
            /queues.planCommandQueue.url="${planCommandQueueEndpoint}\/${planCommandQueueName}"/
          ].join(',')

          def extraCommands = [
            "--set ${helmValues}"
          ].join(' ')

          defraUtils.deployRemoteChart(serviceNamespace, serviceName, containerTag, extraCommands)
        }
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(KUBE_CREDENTIALS_ID, serviceName, mergedPrNo)
      }
      stage('Remove PR infrastructure') {
        defraUtils.destroyPrDatabaseRoleAndSchema(prPostgresExternalNameCredId, prPostgresDatabaseName, prPostgresUserCredId, pr)
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
