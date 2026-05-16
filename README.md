# BidBuds — AI-Powered Live Auction Platform

<img width="1899" height="968" alt="image" src="https://github.com/user-attachments/assets/b43c7f71-1bc7-4044-8bbe-a69af350ad57" />
<img width="1898" height="971" alt="image" src="https://github.com/user-attachments/assets/93cd3508-99cb-4758-93cc-95390ad8f68c" />
<img width="1900" height="970" alt="image" src="https://github.com/user-attachments/assets/37ff0237-0ddf-46f6-8a9b-6942de318b6d" />

BidBuds is a modern, AI-powered live auction platform where users can bid on premium items in real-time. The platform features AI-driven price recommendations, real-time bidding, secure payments via Stripe, and an intuitive admin dashboard.

---

## 🌟 Features

### User Features

- **Live Auctions** — Real-time bidding with live updates
- **AI Price Advisor** — AI-powered price recommendations based on market trends
- **Credit System** — Buy credits via Stripe and use them to bid
- **Auction Filtering** — Filter by category, price range, and more
- **Auction Search** — Quick search across all active auctions
- **User Dashboard** — Track your bids, wins, and credit balance
- **Multiple Categories** — Watches, Fine Art, Automobiles, Jewelry, Wine, Collectibles, and more

### Admin Features

- **Admin Dashboard** — Manage all auctions and users
- **Create Auctions** — Upload items with images, descriptions, and pricing
- **Credit Manager** — Add/deduct credits from user accounts
- **User Management** — View all users and their activity
- **Auction Analytics** — Track active auctions, bidders, revenue, and trends
- **AI Price Suggestions** — Get market analysis before creating auctions

### Payment & Billing

- **Stripe Integration** — Secure credit card payments
- **Credit Wallet** — Prepaid credits system (1 credit = $1 USD)
- **Payment Tracking** — Transaction history and receipts
- **Auto Settlement** — Automatic credit deduction when winning auctions

### Technical Features

- **Real-time Updates** — Socket.io for live bidding
- **JWT Authentication** — Secure user sessions
- **MongoDB Database** — Scalable data storage
- **Responsive Design** — Works on desktop, tablet, and mobile
- **AI Integration** — OpenAI API for price analysis and recommendations

---

## 🏗️ Architecture

### Frontend

- **Framework**: React.js with React Router
- **Styling**: Inline CSS with Tailwind utilities
- **Icons**: Lucide React
- **Deployment**: Netlify

### Backend

- **Framework**: Node.js with Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT with middleware
- **File Upload**: Multer for image handling
- **Real-time**: Socket.io for live updates
- **Payments**: Stripe API
- **AI**: OpenAI API for price analysis
- **Deployment**: Render

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- MongoDB Atlas account
- Stripe account
- OpenAI API key (optional, for AI features)

### Backend Setup

1. Clone the repository

```bash
git clone https://github.com/rachit23tech/BidBuds.git
cd BidBuds/backend
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Start the server

```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend

```bash
cd ../frontend
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

4. Start the development server

```bash
npm start
```

The frontend will run on `http://localhost:3000`

---

## 📁 Project Structure

```
bidbuzd/
├── backend/
│   ├── models/
│   │   ├── user.js
│   │   ├── auction.js
│   │   ├── bid.js
│   │   └── creditTopup.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── auctionRoutes.js
│   │   ├── bidRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── adminRoutes.js
│   │   └── aiRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── services/
│   │   ├── auctionSettlementService.js
│   │   └── notificationService.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Auctions.jsx
    │   │   ├── AuctionRoom.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── BuyCredits.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── AIAdvisorPanel.jsx
    │   │   └── shared/
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── index.jsx
    └── package.json
```

---

## 🔐 Authentication

BidBuds uses JWT (JSON Web Tokens) for authentication:

- User registers with email and password
- Backend generates JWT token stored in localStorage
- Token is sent with every API request in the `Authorization` header
- Protected routes check token validity

### Admin Access

Users need `role: "admin"` in their profile to access:

- Admin Dashboard
- Create auctions
- Manage users
- View analytics

---

## 💳 Payment Flow

1. User buys credits via Stripe checkout
2. Stripe processes payment securely
3. Backend confirms payment and credits user account
4. User can now bid using credits
5. Winning bid automatically deducts credits from account

### Stripe Setup

- Get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
- Add `STRIPE_SECRET_KEY` to backend `.env`
- Add `REACT_APP_STRIPE_PUBLIC_KEY` to frontend `.env`

---

## 🤖 AI Features

### Price Advisor

- Uses OpenAI API to analyze market trends
- Suggests optimal starting prices for auctions
- Provides market insights and comparable sales data
- Shows bullish/bearish sentiment

### AI Win Score

- Estimates probability of winning an auction
- Considers bidder count, bid history, and item demand
- Helps users make informed bidding decisions

---

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "user"),
  credits: Number (default: 1000),
  createdAt: Date,
  updatedAt: Date
}
```

### Auction
```javascript
{
  itemName: String,
  category: String,
  description: String,
  basePrice: Number,
  currentBid: Number,
  highestBidder: String,
  bidderCount: Number,
  endTime: Date,
  status: String, // active, pending_payment, sold, ended, awaiting_admin
  winnerId: String,
  finalPrice: Number,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Bid
```javascript
{
  auctionId: ObjectId,
  bidderId: ObjectId,
  amount: Number,
  timestamp: Date
}
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### Auctions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auctions` | Get all active auctions |
| GET | `/auctions/:id` | Get auction details |
| POST | `/auctions/create` | Create new auction (admin only) |
| DELETE | `/auctions/:id` | Delete auction (admin only) |

### Bidding
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bids/place` | Place a bid |
| GET | `/bids/auction/:id` | Get bids for auction |
| GET | `/bids/credits` | Get user's credits |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-credits-checkout` | Create Stripe checkout |
| POST | `/payments/confirm-credits` | Confirm payment |
| POST | `/payments/pay-winning-bid` | Pay for winning bid |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all users |
| POST | `/admin/add-credits` | Add credits to user |
| POST | `/admin/deduct-credits` | Deduct credits from user |
| POST | `/admin/auction-decision` | Resolve unclaimed auction |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/price` | Get AI price recommendation |

---

## 🚢 Deployment

### Backend (Render)

1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to `main` branch

### Frontend (Netlify)

1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically on push to `main` branch

---

## 🛠️ Troubleshooting

**Images not loading after deployment**
- Check that backend serves `/uploads` folder: `app.use('/uploads', express.static('uploads'))`
- Verify `imageUrl` in database uses the correct domain (not `localhost`)
- Create new auctions to test image upload

**Payment not working**
- Verify Stripe keys are correct in `.env`
- Check Stripe webhook is configured
- Ensure `FRONTEND_URL` matches your actual frontend domain

**MongoDB connection error**
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas (allow all IPs: `0.0.0.0/0`)
- Test connection with `mongosh`

**JWT authentication failing**
- Ensure token is sent in `Authorization: Bearer <token>` header
- Check token hasn't expired (default: 7 days)
- Verify `JWT_SECRET` is the same on the backend

---

## 📱 Mobile Responsiveness

BidBuds is fully responsive:

- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Optimized layout with touch-friendly buttons
- **Mobile**: Vertical layout with hamburger menu

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS protection
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection with React
- ✅ Secure payment processing with Stripe
- ✅ HTTPS enforced in production
- ✅ Environment variables for secrets

---

## 🚀 Future Enhancements

- [ ] Wishlist/Favorites system
- [ ] Real-time notifications
- [ ] User profiles and ratings
- [ ] Auto-bidding feature
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Video auction item uploads
- [ ] Auction schedule (future auctions)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Fraud detection system
- [ ] Social media integration

---

## 👥 Contributors

- **Ayush Unhale** — Backend Developer
- **Rachit Arora** — Frontend & AI Integration

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for AI price analysis
- [Stripe](https://stripe.com) for payment processing
- [Render](https://render.com) for backend hosting
- [Netlify](https://netlify.com) for frontend hosting
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database services
- [Socket.io](https://socket.io) for real-time updates

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

Happy Bidding! 🎉
