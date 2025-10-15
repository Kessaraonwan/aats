FROM golang:1.23-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go env -w GOPROXY=https://proxy.golang.org
RUN go mod download
COPY . .
RUN go build -o server ./

FROM alpine:3.18
WORKDIR /app
COPY --from=build /app/server /app/server
COPY .env.example /app/.env
COPY public /app/public
EXPOSE 8081
CMD ["/app/server"]