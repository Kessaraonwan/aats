FROM golang:1.21-alpine AS build
WORKDIR /src

# Install git for module downloads and ca-certificates
RUN apk add --no-cache git ca-certificates

COPY go.mod .
COPY . .

RUN go env -w GO111MODULE=on
# Download modules (populate go.sum) before building
RUN go mod tidy
RUN go build -o /app/main ./

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=build /app/main /app/main
EXPOSE 8080
ENTRYPOINT ["/app/main"]
