## 🚀 快速开始

### 环境要求

- Go 1.23.2+
- Node.js 18+
- PostgreSQL (可选，支持 SQLite)
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd yolo
```

### 2. 后端设置

```bash
# 安装Go依赖
make deps

# 配置环境变量 (可选)
export DB_TYPE=sqlite
export DB_CONNECTION=./yolo.db
export JWT_SECRET=your-secret-key

# 运行后端服务
make run
# 或开发模式
make dev
```

### 3. 前端设置

```bash
cd frontend-yolo

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 智能合约部署

```bash
cd july-workshop

# 安装依赖
npm install

# 编译合约
npx hardhat compile

# 部署合约 (需要配置网络)
npx hardhat run scripts/deploy-erc20.js --network <network>
```

## 📡 API 接口

### 公开接口

- `GET /health` - 健康检查
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/tokens` - 获取所有代币
- `GET /api/v1/tokens/:symbol` - 获取指定代币信息
- `GET /api/v1/tokens/:symbol/price-history` - 获取价格历史

### 认证接口 (需要 JWT Token)

- `GET /api/v1/user/profile` - 获取用户资料
- `PUT /api/v1/user/profile` - 更新用户资料
- `GET /api/v1/user/balance` - 获取用户余额
- `GET /api/v1/user/holdings` - 获取用户持仓
- `POST /api/v1/tokens` - 创建代币
- `POST /api/v1/web3/deploy-token` - 部署代币合约
- `POST /api/v1/web3/swap` - 代币交换
- `POST /api/v1/web3/add-liquidity` - 添加流动性

## 🧪 测试

```bash
# 运行所有测试
make test

# 运行测试并生成覆盖率报告
make test-coverage

# 查看覆盖率报告
open coverage.html
```

## 🔧 开发工具

```bash
# 代码格式化
make fmt

# 代码检查
make lint

# 清理构建文件
make clean

# 查看所有可用命令
make help
```

## 📊 数据库模型

### 核心表结构

- **users** - 用户信息
- **user_tokens** - 用户创建的代币
- **user_holdings** - 用户持仓记录
- **price_history** - K 线价格数据
- **gift_records** - 赠送记录 (开发中)

## 🔐 环境变量

| 变量名           | 描述             | 默认值      |
| ---------------- | ---------------- | ----------- |
| `DB_TYPE`        | 数据库类型       | `sqlite`    |
| `DB_CONNECTION`  | 数据库连接字符串 | `./yolo.db` |
| `JWT_SECRET`     | JWT 密钥         | 随机生成    |
| `GIN_MODE`       | Gin 运行模式     | `release`   |
| `SKIP_WEB3_INIT` | 跳过 Web3 初始化 | `false`     |

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送 Pull Request
- 邮箱: [weirong.zhou@outlook.com](mailto:weirong.zhou@outlook.com)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
