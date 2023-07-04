# Production Build
# Google Cloud Run will inject a $PORT env variable which will be consumed by Express during runtime. Ex. ENV PORT 8083

###############
# build stage #
###############

ARG NODE_VERSION=16.13.1

FROM node:${NODE_VERSION}-alpine as build
WORKDIR /build

COPY package.json package-lock.json tsconfig.json tsconfig.compile.json .barrelsby.json swagger.json ./

RUN npm ci --prefer-offline --no-audit

COPY ./src ./src

RUN npm run build

###############
# runtime stage #
###############

FROM node:${NODE_VERSION}-alpine as runtime
WORKDIR /app

# Installs only production dependencies
COPY package.json package-lock.json swagger.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit

# Copy the build files
COPY --from=build /build/dist ./dist

EXPOSE 8083

CMD ["npm", "run", "start:prod"]
