[![Known Vulnerabilities](https://snyk.io//test/github/DEFRA/ffc-elm-plan-service/badge.svg?targetFile=package.json)](https://snyk.io//test/github/DEFRA/ffc-elm-plan-service?targetFile=package.json)

# FFC ELM plan service

Future Farming and Countryside programme ELM plan service. This service is being used to trial event-driven architecture in the context of Environmental Land Management (ELM) delivery.

## Prerequisites

Either:
- Docker
- Docker Compose

Or:
- Kubernetes
- Helm

Or:
- Node 10
- PostgreSQL database
- AWS SQS compatible message queue

## Environment variables

The following environment variables are required by the application container. Values for development are set in the Docker Compose configuration. Default values for production-like deployments are set in the Helm chart and may be overridden by build and release pipelines.

| Name                     | Description                    | Required | Default                          | Valid                             | Notes                |
|--------------------------|--------------------------------|:--------:|----------------------------------|:---------------------------------:|----------------------|
| NODE_ENV                 | Node environment               | no       |                                  | development, test, production     |                      |
| PORT                     | Port number                    | no       | 3003                             |                                   |                      |
| POSTGRES_DB              | Postgres database              | yes      |                                  |                                   |                      |
| POSTGRES_USERNAME        | Postgres username              | yes      |                                  |                                   |                      |
| POSTGRES_PASSWORD        | Postgres password              | yes      |                                  |                                   |                      |
| PLAN_QUEUE_NAME          | Message queue name             | no       | plan                             |                                   |                      |
| PLAN_ENDPOINT            | Message base url               | no       | http://localhost:9324            |                                   |                      |
| PLAN_QUEUE_URL           | Message queue url              | no       | http://localhost:9324/queue/plan |                                   | or tcp               |
| PLAN_QUEUE_REGION        | AWS region                     | no       | eu-west-2                        |                                   | Ignored in local dev |
| PLAN_QUEUE_ACCESS_KEY_ID | Message access key Id          | no       |                                  |                                   |                      |
| PLAN_QUEUE_ACCESS_KEY    | Message access key             | no       |                                  |                                   |                      |
| CREATE_PLAN_QUEUE        | Create queue before connection | no       | true                             | Must be false for AWS deployments |                      |

## How to run tests

A convenience script is provided to run automated tests in a containerised environment. The first time this is run, container images required for testing will be automatically built. An optional `--build` (or `-b`) flag may be used to rebuild these images in future (for example, to apply dependency updates).

```
# Run tests
scripts/test

# Rebuild images and run tests
scripts/test --build
```

This runs tests via a `docker-compose run` command. If tests complete successfully, all containers, networks and volumes are cleaned up before the script exits. If there is an error or any tests fail, the associated Docker resources will be left available for inspection.

Alternatively, the same tests may be run locally via npm:

```
# Run tests without Docker
npm run test
```

### Test watcher

A more convenient way to run tests in development is to use a file watcher to automatically run tests each time associated files are modified. For this purpose, the default docker-compose configuration mounts all app, test and git files into the main `app` container, enabling the test watcher to be run as shown below. The same approach may be used to execute arbitrary commands in the running app.

```
# Run unit test file watcher
docker-compose exec app npm run test:unit-watch

# Run all tests
docker-compose exec app npm test

# Open an interactive shell in the app container
docker-compose exec app sh
```

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

By default, the start script will build (or rebuild) images so there will rarely be a need to build images manually. However, this can be achieved through the Docker Compose [build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start and stop the service

Use Docker Compose to run service locally. The default configuration will run the service on an isolated Docker network. An alternative configuration is provided for linking to other ELM services on the same Docker host.

```
# Start the service in isolation
docker-compose up

# Start service on the external `ffc-elm` Docker network
docker-compose -f docker-compose.yaml -f docker-compose.link.yaml up
```

### Test the service

The service binds to a port on the host machine so it can be tested manually by sending HTTP requests to the bound port using a tool such as [Postman](https://www.getpostman.com), `wget` or `curl`.

```
# Send a sample request to the /submit endpoint
wget -qO- --header "Content-Type: application/json" --post-data '{"planId":"PLAN123"}' http://localhost:3003/submit
```

Sample valid JSON for the `/submit` endpoint is:

```
{
  "planId": "PLAN123"
}
```

### Deploy to Kubernetes

For production deployments, a helm chart is included in the `.\helm` folder. This service connects to an sqs message broker, using credentials defined in [values.yaml](./helm/ffc-elm-plan-service/values.yaml), which must be made available prior to deployment.

Scripts are provided to test the Helm chart by deploying the service, along with an appropriate message broker, into the current Helm/Kubernetes context.

```
# Deploy to current Kubernetes context
scripts/helm/install

# Remove from current Kubernetes context
scripts/helm/delete


#### Accessing the pod

By default, the service is not exposed via an endpoint within Kubernetes.

Access may be granted by forwarding a local port to the deployed pod:

```
# Forward local port to the Kubernetes deployment
kubectl port-forward --namespace=ffc-demo deployment/ffc-elm-plan-service 3003:3003
```

Once the port is forwarded, the service can be accessed and tested in the same way as described in the "Test the service" section above.

#### Probes

The service has both an Http readiness probe and an Http liveness probe configured to receive at the below end points.

Readiness: `/healthy`
Liveness: `/healthz`

## Dependency management

Dependencies should be managed within a container using the development image for the app. This will ensure that any packages with environment-specific variants are installed with the correct variant for the contained environment, rather than the host system which may differ between development and production.

The [`exec`](./scripts/exec) script is provided to run arbitrary commands, such as npm, in a running service container. If the service is not running when this script is called, it will be started for the duration of the command and then removed.

Since dependencies are installed into the container image, a full build should always be run immediately after any dependency change.

In development, the `node_modules` folder is mounted to a named volume. This volume must be removed in order for dependency changes to propagate from the rebuilt image into future instances of the app container. The [`start`](./scripts/start) script has a `--clean` (or `-c`) option  which will achieve this.

The following example will update all npm dependencies, rebuild the container image and replace running containers and volumes:

```
# Run the NPM update
scripts/exec npm update

# Rebuild and restart the service
scripts/start --clean
```

## Build Pipeline

The [azure-pipelines.yaml](azure-pipelines.yaml) performs the following tasks:
- Runs unit tests
- Publishes test result
- Pushes containers to the registry tagged with the PR number or release version
- Deletes PR deployments, containers, and namepace upon merge

Builds will be deployed into a namespace with the format `ffc-elm-plan-service-{identifier}` where `{identifier}` is either the release version, the PR number, or the branch name.

A detailed description on the build pipeline and PR work flow is available in the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
