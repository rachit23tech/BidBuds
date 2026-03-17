import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/login"
import Register from "./pages/register"
import Auctions from "./pages/auctions"
import AuctionRoom from "./pages/auctionRoom"
import AdminDashboard from "./pages/admind dashboard"
import BuyCredits from "./pages/Buycredits"
import Profile from "./pages/profile"

function App() {

 return (
  <BrowserRouter>

   <Routes>

    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/auctions" element={<Auctions />} />
    <Route path="/auction/:id" element={<AuctionRoom />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/buy-credits" element={<BuyCredits />} />
    <Route path="/profile" element={<Profile />} />

   </Routes>

  </BrowserRouter>
 )

}

export default App
