# Checkit

# Backend Assessment — Wallet Microservice System

A microservice-based wallet system built with NestJS, gRPC, Prisma ORM, and PostgreSQL.

---

## Project Structure

```
checkit/
├── apps/
│   ├── user/               # Manages users (HTTP: 5501, gRPC: 5502)
│   └── wallet/             # Manages wallets (HTTP: 5511, gRPC: 5512)
├── packages/
│   ├── grpc/               # Any GRPC related code and protobuf definitions
│   ├── prisma/             # Generated Prisma clients
│   └── nestjs/             # Shared internal nest js libraries (e.g. logging, common utilities)
└── README.md
```

---

## Prerequisites

- Docker and Docker Compose
- `grpcurl` — [Install here](https://github.com/fullstorydev/grpcurl#installation)

---

## Setup

### 1. Configure environment variables

```bash
cp apps/user/.env.template apps/user/.env && cp apps/wallet/.env.template apps/wallet/.env
```

### 2. Run with Docker Compose

Run the application and PostgreSQL databases using Docker Compose. The databases will be initialized and Prisma migrations will run automatically on startup.

```bash
docker-compose up --build
```

---

## Health Checks

```bash
# user service
curl http://localhost:5501/health

# wallet service
curl http://localhost:5511/health
```

---

## API Examples (grpcurl)

> All gRPC requests use plaintext (`-plaintext`) since TLS is not configured locally.
> The proto files are passed with `-proto` for reflection.

---

### User Service — `localhost:5502`

#### Create User

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/user.proto \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe"
  }' \
  localhost:5502 \
  user.UserService/CreateUser
```

**Response:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### Get User By ID

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/user.proto \
  -d '{
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }' \
  localhost:5502 \
  user.UserService/GetUserById
```

**Response:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Wallet Service — `localhost:5512`

#### Create Wallet

> The wallet service calls `UserService.GetUserById` internally to verify the user
> exists before creating the wallet. The request will fail if the user does not exist.

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/wallet.proto \
  -d '{
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }' \
  localhost:5512 \
  wallet.WalletService/CreateWallet
```

**Response:**

```json
{
  "id": "f1e2d3c4-b5a6-7890-abcd-ef0987654321",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "balance": "0.00",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### Get Wallet

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/wallet.proto \
  -d '{
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }' \
  localhost:5512 \
  wallet.WalletService/GetWallet
```

**Response:**

```json
{
  "id": "f1e2d3c4-b5a6-7890-abcd-ef0987654321",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "balance": "0.00",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### Credit Wallet

> `amount` is sent as a string to preserve decimal precision.
> The service parses it internally as `Decimal` before updating the balance.

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/wallet.proto \
  -d '{
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "amount": "500.00"
  }' \
  localhost:5512 \
  wallet.WalletService/CreditWallet
```

**Response:**

```json
{
  "id": "f1e2d3c4-b5a6-7890-abcd-ef0987654321",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "balance": "500.00",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### Debit Wallet

> The service will return a `FAILED_PRECONDITION` error if the wallet
> has insufficient balance to cover the requested debit amount.

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/wallet.proto \
  -d '{
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "amount": "200.50"
  }' \
  localhost:5512 \
  wallet.WalletService/DebitWallet
```

**Response:**

```json
{
  "id": "f1e2d3c4-b5a6-7890-abcd-ef0987654321",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "balance": "299.50",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Examples

#### User not found

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/wallet.proto \
  -d '{"userId": "non-existent-id"}' \
  localhost:5512 \
  wallet.WalletService/CreateWallet
```

```json
{
  "code": 5,
  "message": "User not found"
}
```

#### Insufficient balance

```bash
grpcurl -plaintext \
  -proto packages/grpc/src/lib/proto/wallet.proto \
  -d '{
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "amount": "99999.00"
  }' \
  localhost:5512 \
  wallet.WalletService/DebitWallet
```

```json
{
  "code": 9,
  "message": "Insufficient balance. Current balance is 299.50"
}
```

---

## gRPC Status Codes Reference

| Code | Name                  | Used When                         |
| ---- | --------------------- | --------------------------------- |
| 3    | `INVALID_ARGUMENT`    | Invalid or missing request fields |
| 5    | `NOT_FOUND`           | User or wallet does not exist     |
| 6    | `ALREADY_EXISTS`      | Duplicate user email or wallet    |
| 9    | `FAILED_PRECONDITION` | Insufficient wallet balance       |
