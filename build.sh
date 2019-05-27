#!/usr/bin/env bash

set -e

AWS_ECR_ADDR="251953125803.dkr.ecr.us-east-1.amazonaws.com"
EB_ENVIRONMENT="alpe-securitizacao-api-dev"
EB_APPLICATION="alpe-securitizacao"

IMAGE_BASE="alpe-images/alpe-securitizacao-monolith"
EB_BUCKET="elasticbeanstalk-us-east-1-251953125803"
AWS_REGION="us-east-1"

AWS_ECR_IMAGE="${AWS_ECR_ADDR}/${IMAGE_BASE}"
LOCAL_IMAGE="${IMAGE_BASE}"

EXECUTION_DATE="$(date +%Y%m%d%H%M)"
VERSION="${EXECUTION_DATE:-$(git tag | tail -n 1)}"

echo "TAGGING:"
echo ${AWS_ECR_IMAGE}:latest
echo ${AWS_ECR_IMAGE}:${VERSION}

docker build -t ${LOCAL_IMAGE}:latest -t ${LOCAL_IMAGE}:${VERSION} . \
&& docker image tag ${LOCAL_IMAGE}:latest ${AWS_ECR_IMAGE}:latest \
&& docker image tag ${LOCAL_IMAGE}:latest ${AWS_ECR_IMAGE}:${VERSION} \
&& echo "TAGGED:" \
&& docker image ls --filter "reference=${LOCAL_IMAGE}" \
&& docker image ls --filter "reference=${AWS_ECR_IMAGE}" \
&& echo "ASSUME ROLE START..." \
&& source ./awscliassumerole.sh \
&& echo "ASSUME ROLE END..." \
&& echo "LOGGIN IN ECR..." \
&& eval $(aws ecr get-login --no-include-email --region us-east-1) \
&& echo "PUSHING IMAGES..." \
&& docker image push ${AWS_ECR_IMAGE}:${VERSION} \
&& docker image push ${AWS_ECR_IMAGE}:latest \
&& aws configure set default.region ${AWS_REGION} \
&& echo "CREATE APP VERSION..." \
&& cd ./aws \
&& cp ./Dockerrun.aws.json.template ./Dockerrun.aws.json \
&& sed -i 's/@version@/'"${VERSION}"'/g' ./Dockerrun.aws.json \
&& echo "PUSHING APP VERSION..." \
&& zip -9 ${VERSION}-${EB_ENVIRONMENT} Dockerrun.aws.json \
&& zip -9 -r ${VERSION}-${EB_ENVIRONMENT} .ebextensions \
&& aws s3 cp ./${VERSION}-${EB_ENVIRONMENT}.zip s3://${EB_BUCKET}/${EB_ENVIRONMENT}/${VERSION}-${EB_ENVIRONMENT}.zip \
&& echo "DELETING APP VERSION LOCALLY..." \
&& rm ./${VERSION}-${EB_ENVIRONMENT}.zip \
&& rm ./Dockerrun.aws.json \
&& echo "UPDATING APP VERSION..." \
&& aws elasticbeanstalk create-application-version --application-name ${EB_APPLICATION} --version-label ${EB_ENVIRONMENT}-${VERSION} --description "${EB_ENVIRONMENT}, version TAG: ${VERSION}" --source-bundle S3Bucket=$EB_BUCKET,S3Key=${EB_ENVIRONMENT}/${VERSION}-${EB_ENVIRONMENT}.zip \
&& aws elasticbeanstalk update-environment --environment-name ${EB_ENVIRONMENT} --version-label ${EB_ENVIRONMENT}-${VERSION}
