# GPU Server WebApp

This repository contains the code for the web application, meaning, the frontend (user visible) and the backend (database etc interaction). It is written in [Next.js](https://nextjs.org/).

## First setup

Before you can develop this repo locally, you follow a few steps:

1. Install PostgreSQL.
2. Copy the `.env.example` to `.env` and fill in the properties. (see Discord for credentials)
3. Install NodeJS
4. Run `npm install` to install the dependencies.

## Local development

1. Make sure the PostgreSQL database is running.
2. Run `npm run dev`, the web application will start. Go to https://localhost:5001 in your browser. If you make a code change, this will immediately be updated in the browser.

## Database modifications

When you adjust the database schema (`prisma/schema.prisma`), you must update the local database using migrations.

Run the following commands to update your local database:

-   `npx prisma migrate dev`
-   `npx prisma generate`

## Dockerfile tensorflow/federated

This repo uses the [tensorflow/federated](https://github.com/tensorflow/federated) repository and its Dockerfile. The build version of this Dockerfile is not officially stored in docker hub. Because of this a custom built version of the Dockerfile is located [here](https://hub.docker.com/r/codestix/federated).

```
docker pull codestix/federated
```

### Build and publish new version

1. Create a new repository or use existing repository on [hub.docker.com](https://hub.docker.com).
2. Login using the `docker login` command.
3. Clone the tensorflow/federated git repository ...

    ```
    git clone https://github.com/tensorflow/federated
    cd federated
    ```

4. Build the image using ... (make sure to replace versions and tag)

    ```
    docker build --build-arg VERSION="0.23.0" --network=host  --file "tensorflow_federated/tools/runtime/container/release.Dockerfile" -t codestix/federated:0.23.0 .
    ```

5. Push the built image to Docker Hub ... (make sure to replace tag and version)

    ```
    docker push codestix/federated:0.23.0
    ```
