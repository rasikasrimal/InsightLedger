# InsightLedger — Architecture & Flow (Mermaid diagrams)

This file contains high-level architecture diagrams for the InsightLedger repository. Each diagram is written in Mermaid so you can render them in GitHub or any Mermaid-compatible renderer.

Notes:
- These are high-level, technology-agnostic diagrams intended to help engineers orient themselves before touching the codebase.
- Tweak component names and connections to match repository specifics (service names, ports, cloud provider, etc.).
- If you want me to convert any of these into PNG/SVG files, or to align them with specific folders/classes in the repo, tell me which files to map and I will generate a mapping and update diagrams.

---

## Architecture & Flow
C4 slices, ERDs, and runtime flows that help engineers orient themselves before touching the repo.

### C4 Level 1 — Context
```mermaid
flowchart LR
  User["User\n(Trader / Admin)"]
  Frontend["Web / Mobile App"]
  API["InsightLedger API\n(REST / GraphQL)"]
  Ledger["Distributed Ledger / Nodes"]
  DB["Primary Database"]
  IdP["Identity Provider\n(OAuth / SSO)"]
  Payment["Payment Gateway / External Systems"]
  Analytics["Analytics / Monitoring"]

  User -->|Uses| Frontend
  Frontend -->|API calls| API
  API --> DB
  API --> Ledger
  API --> IdP
  API --> Payment
  API --> Analytics
  Ledger -->|Event stream / confirmations| API
  DB -->|replication / backup| Analytics
```

---

### C4 Level 2 — Containers
```mermaid
flowchart LR
  subgraph Client
    FE[Frontend SPA\n(Web / Mobile)]
  end

  subgraph Backend
    API["API Server\n(Node / Java / Go)"]
    Worker["Worker / Batch Processor"]
    Auth["Auth Service\n(OIDC / JWT)"]
    Broker["Message Broker\n(Kafka / RabbitMQ)"]
    Crypto["Crypto Service\n(Signing, KMS)"]
  end

  subgraph Data
    DB["Relational DB\n(Postgres)"]
    Cache["Cache\n(Redis)"]
    LedgerNodes["Ledger Nodes\n(Private / Consortium)"]
    ObjectStorage["Object Storage\n(S3)"]
  end

  FE --> |HTTPS| API
  API --> Auth
  API --> DB
  API --> Cache
  API --> Broker
  API --> Crypto
  Worker --> Broker
  Worker --> LedgerNodes
  Worker --> DB
  LedgerNodes --> DB
  DB --> ObjectStorage
```

---

### C4 Level 3 — Components (Backend API)
```mermaid
flowchart LR
  API["API Server"]
  Controller["HTTP Controllers / Handlers"]
  Service["Domain Services\n(ledger, accounting)"]
  Validator["Input Validator"]
  Repo["Repositories\n(DB access)"]
  EventPub["Event Publisher\n(to Broker)"]
  CryptoMod["Crypto Module\n(sign, verify)"]
  AuthLib["Auth Middleware\n(jwt, roles)"]

  Controller -->|validate| Validator
  Controller -->|auth| AuthLib
  Controller --> Service
  Service --> Repo
  Service --> CryptoMod
  Service --> EventPub
  Repo --> DB
  EventPub --> Broker
  CryptoMod --> KMS[KMS / HSM]
```

---

### Database ERD
```mermaid
erDiagram
  USERS {
    int id PK
    string username
    string email
    string role
    datetime created_at
  }
  ACCOUNTS {
    int id PK
    int user_id FK
    string account_type
    decimal balance
    datetime created_at
  }
  TRANSACTIONS {
    int id PK
    int from_account_id FK
    int to_account_id FK
    decimal amount
    string status
    string ledger_tx_hash
    datetime created_at
  }
  BLOCKS {
    int id PK
    string block_hash
    datetime timestamp
  }
  CONTRACTS {
    int id PK
    string contract_address
    string metadata
  }
  AUDIT_LOGS {
    int id PK
    int user_id FK
    string action
    string details
    datetime created_at
  }

  USERS ||--o{ ACCOUNTS : owns
  ACCOUNTS ||--o{ TRANSACTIONS : "source/target"
  TRANSACTIONS }o--|| BLOCKS : "included_in"
  CONTRACTS ||--o{ TRANSACTIONS : "invoked_by"
  USERS ||--o{ AUDIT_LOGS : "performed"
```

---

### Deployment topology — Infrastructure and deployment architecture
```mermaid
flowchart LR
  LB[Load Balancer\n(Cloud LB / ALB)]
  Ingress[Ingress Controller\n(K8s)]
  subgraph K8s["Kubernetes Cluster"]
    API_Pods["API Pods"]
    Worker_Pods["Worker Pods"]
    Auth_Pods["Auth / IAM"]
    Broker_Pods["Message Broker StatefulSet"]
  end
  DBCluster["Managed DB Cluster\n(Postgres HA)"]
  ObjectStore["S3 / Object Storage"]
  LedgerCluster["Ledger Node Cluster\n(consortium/private)"]
  KMS["KMS / HSM"]
  CI["CI/CD Pipeline\n(GitHub Actions / GitLab CI)"]

  LB --> Ingress
  Ingress --> API_Pods
  Ingress --> Auth_Pods
  API_Pods --> Broker_Pods
  API_Pods --> DBCluster
  Worker_Pods --> Broker_Pods
  Worker_Pods --> LedgerCluster
  Worker_Pods --> DBCluster
  LedgerCluster --> DBCluster
  API_Pods --> KMS
  CI -->|deploy| K8s
  CI -->|deploy| LedgerCluster
```

---

### Detailed data flow — Data flow through the system components
```mermaid
flowchart LR
  User -->|submit tx| Frontend
  Frontend -->|POST /tx| API
  API -->|auth| Auth
  API -->|validate| Validator
  API -->|store pending| DB
  API -->|publish| Broker
  Broker -->|consume| Worker
  Worker -->|sign| Crypto
  Worker -->|submit| Ledger
  Ledger -->|confirm| Worker
  Worker -->|update status| DB
  Worker -->|emit event| EventBus[Event Bus / Webhooks]
  EventBus -->|notify| Frontend
  Analytics -->|ingest| EventBus
```

---

### Sequence of interactions — User transaction flow
```mermaid
sequenceDiagram
  participant U as User (Client)
  participant FE as Frontend
  participant API as API Server
  participant Auth as Auth Service
  participant DB as Database
  participant Worker as Worker
  participant Ledger as Ledger Node
  participant KMS as KMS / HSM

  U->>FE: create transaction
  FE->>API: POST /transactions (JWT)
  API->>Auth: verify JWT
  Auth-->>API: JWT valid / user info
  API->>API: validate payload
  API->>DB: insert transaction (status: pending)
  API->>Worker: publish transaction event
  Worker->>KMS: request signing key
  KMS-->>Worker: signed payload / key
  Worker->>Ledger: submit signed transaction
  Ledger-->>Worker: confirmation / tx_hash
  Worker->>DB: update transaction (status: confirmed, tx_hash)
  Worker->>FE: push notification (via WebSocket)
  FE-->>U: display confirmation
```

---

### System Architecture — Complete system architecture diagram
```mermaid
flowchart TD
  subgraph UserPlane
    User["User Interfaces\n(Web / Mobile / CLI)"]
  end

  subgraph ControlPlane
    FE["Frontend"]
    API["API Server"]
    Auth["Auth Service"]
    Admin["Admin UI"]
  end

  subgraph Processing
    Broker["Message Broker"]
    Worker["Worker / Orchestrator"]
    Crypto["Crypto Service / KMS"]
    Ledger["Ledger Node Cluster"]
  end

  subgraph Storage
    DB["Relational DB"]
    Cache["Redis"]
    Blob["Object Storage"]
    Logs["Audit Logging / SIEM"]
  end

  User --> FE
  FE --> API
  API --> Auth
  API --> DB
  API --> Cache
  API --> Broker
  Broker --> Worker
  Worker --> Crypto
  Worker --> Ledger
  Ledger --> DB
  Worker --> Logs
  API --> Admin
  Admin --> DB
  Logs -->|export| SIEM["Security / Monitoring"]
```

---

## Security & Governance

### BPMN (user request -> approval -> commit to ledger)
```mermaid
flowchart TD
  Start([Start])
  Request["User submits transaction\n(validate & sign)"]
  ManualApproval{"Requires Manual Approval?"}
  Approve[Approve]
  Reject[Reject]
  Encrypt["Encrypt & Prepare Payload"]
  SubmitLedger["Submit to Ledger"]
  Confirm["Confirm & Notify User"]
  End([End])

  Start --> Request --> ManualApproval
  ManualApproval -- Yes --> Approve --> Encrypt
  ManualApproval -- No --> Encrypt
  Encrypt --> SubmitLedger --> Confirm --> End
  ManualApproval -- Reject --> Reject --> End
```

---

### Encryption/decryption sequence — Detailed encryption and decryption flow
```mermaid
sequenceDiagram
  participant Client
  participant API
  participant KMS
  participant Worker
  participant Ledger

  Client->>API: POST /tx (encryptedPayload, signature)
  API->>KMS: decryptKeyRequest (keyId, auth)
  KMS-->>API: decryptedKey (wrappedKey)
  API->>Worker: enqueue(tx, wrappedKey)
  Worker->>KMS: unwrapKey(wrappedKey)
  KMS-->>Worker: unwrappedKey
  Worker->>Ledger: signAndSubmit(tx, unwrappedKey)
  Ledger-->>Worker: txHash / confirmation
  Worker->>API: updateStatus(txHash)
  API->>Client: 200 OK (txHash)
```

---

### Role-based access control (RBAC)
```mermaid
flowchart LR
  AdminRole["Role: Admin"]
  UserRole["Role: User"]
  AuditorRole["Role: Auditor"]
  ServiceRole["Role: Service"]

  Resource_Accounts["Resource: Accounts"]
  Resource_Transactions["Resource: Transactions"]
  Resource_Contracts["Resource: Smart Contracts"]
  Resource_Audit["Resource: Audit Logs"]

  AdminRole -->|CRUD| Resource_Accounts
  AdminRole -->|CRUD| Resource_Transactions
  AdminRole -->|CRUD| Resource_Contracts
  AuditorRole -->|READ| Resource_Audit
  AuditorRole -->|READ| Resource_Transactions
  UserRole -->|CREATE/READ| Resource_Transactions
  ServiceRole -->|Invoke| Resource_Contracts
```

---

### Security-aware data flow (highlighting encryption, keys, and isolation)
```mermaid
flowchart LR
  User -->|TLS| FE
  FE -->|TLS / JWT| API
  API -->|Encrypted-at-rest| DB
  API -->|Publish| Broker
  Broker -->|Internal TLS| Worker
  Worker -->|HSM / KMS| KMS
  Worker -->|Signed tx| Ledger
  Ledger -->|WORM / append-only| BlockStorage
  Admin -->|MFA| Auth
  Logs --> SIEM
```

---

### Threat model quickview
```mermaid
flowchart LR
  subgraph Assets
    A1[User Credentials]
    A2[Transaction Data]
    A3[Signing Keys]
    A4[Ledger Integrity]
  end

  subgraph Threats
    T1[Credential Theft\n(phishing)]
    T2[Data Tampering\n(at rest/in transit)]
    T3[Key Compromise\n(HSM bypass)]
    T4[Insider Abuse]
  end

  subgraph Mitigations
    M1[MFA / OIDC]
    M2[TLS + Encryption at rest]
    M3[HSM / KMS, key rotation]
    M4[Audit Logs, RBAC, Approval Workflows]
  end

  A1 --> T1
  A2 --> T2
  A3 --> T3
  A4 --> T2
  T1 --> M1
  T2 --> M2
  T3 --> M3
  T4 --> M4
```

---
