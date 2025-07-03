# NFC Cards Project Structure

## I. Cấu trúc Module

```
src/
├── auth/                  # Module xác thực và phân quyền
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/           # Guards bảo vệ routes
│   │   ├── jwt.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   ├── decorators/       # Custom decorators
│   │   ├── auth.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── permissions.decorator.ts
│   ├── strategies/       # Passport strategies
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── services/         # Business logic
│   │   ├── auth.service.ts    # Xử lý login, register
│   │   └── roles.service.ts   # Quản lý roles & permissions
│   ├── auth.controller.ts     # Route handlers
│   └── auth.module.ts         # Module configuration
│
├── users/                # Module quản lý người dùng
│   ├── dto/             # DTOs cho user operations
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── companies/           # Module quản lý công ty
│   ├── dto/            # DTOs cho company operations
│   ├── services/
│   │   └── companies.service.ts
│   ├── companies.controller.ts
│   └── companies.module.ts
│
├── cards/              # Module quản lý thẻ
│   ├── dto/
│   │   ├── create-card.dto.ts
│   │   └── update-card.dto.ts
│   ├── services/      # Card-related services
│   │   ├── card.service.ts    # Core card logic
│   │   ├── vcard.service.ts   # vCard generation
│   │   └── qr.service.ts      # QR code generation
│   ├── cards.controller.ts
│   └── cards.module.ts
│
├── media/             # Module xử lý media
│   ├── services/
│   │   ├── media.service.ts   # Media processing
│   ├── utils/
│   │   ├── image.utils.ts     # Image processing utilities
│   │   └── video.utils.ts     # Video processing utilities
│   └── media.module.ts
│
├── version/           # Module quản lý phiên bản
│   ├── services/
│   │   ├── version.service.ts # Version control logic
│   └── version.module.ts
│
└── common/            # Shared utilities và services
    ├── pipes/
    ├── filters/
    ├── exceptions/
    ├── services/
    └── shared/
```

## II. Luồng Hoạt Động Chính

### 1. Xác thực & Phân quyền

```typescript
// Đăng ký
Client -> AuthController.register() -> AuthService.register()
-> UserService.create() -> Return JWT

// Đăng nhập
Client -> AuthController.login() -> AuthService.validateUser()
-> (JwtStrategy/LocalStrategy) -> Return JWT

// Kiểm tra quyền
Client Request -> JwtGuard -> RolesGuard -> PermissionsGuard -> Controller
```

### 2. Quản lý User

```typescript
// CRUD User
Client -> UsersController -> UsersService -> Database

// Nâng cấp tài khoản
Client -> AuthController.upgradeRole() -> RolesService.upgrade()
-> Update user_roles
```

### 3. Quản lý Company

```typescript
// Tạo công ty
Client -> CompaniesController.create() -> CompaniesService.create()
-> Database

// Import nhân viên Excel
Client -> CompaniesController.importExcel()
-> ExcelService.process()
-> CompaniesService.bulkCreate()
-> Database
```

### 4. Quản lý Card

```typescript
// Tạo thẻ mới
Client -> CardsController.create()
-> MediaService.processMedia()
-> CardService.create()
-> (QRService.generate() + VCardService.generate())
-> Database

// Cập nhật thẻ với media
Client -> CardsController.update()
-> MediaService.processMedia()
-> CardService.update()
-> Database

// Quản lý phiên bản
Client -> CardsController.createVersion()
-> VersionService.create()
-> Database
```

### 5. Xử lý Media

```typescript
// Upload và xử lý ảnh
Client -> CardsController.update()
-> MediaService.processImage()
-> Upload to Storage
-> Return URL
-> CardService.update()

// Thêm video
Client -> CardsController.addVideo()
-> MediaService.validateYoutubeUrl()
-> CardService.update()
```

## III. Phân Quyền

- **superadmin**: Quản lý toàn bộ hệ thống
- **admin**: Quản lý trong phạm vi công ty
- **manager**: Quản lý nhóm nhân viên
- **employee**: Quản lý thẻ cá nhân

## IV. Tính Năng Bảo Mật

- JWT Authentication
- Role-based Access Control
- Permission-based Access Control
- Rate Limiting
- File upload validation
- Input sanitization

## V. Phân Công Phát Triển

- Auth Module
- Users Module
- Companies Module
- Common Module
- Cards Module
- Media Module
- Version Module
