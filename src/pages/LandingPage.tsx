import React from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Logo />

          <div className="space-x-6 hidden md:block">
            <Link to="/login" className="text-slate-400 hover:text-white">
              Login
            </Link>

            <Link
              to="/signup"
              className="bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}

      <section className="py-32 px-6 text-center max-w-5xl mx-auto">

        <h1 className="text-5xl md:text-7xl font-black mb-6">
          Cheap Data & Airtime
          <br />
          Instantly
        </h1>

        <p className="text-xl text-slate-400 mb-10">
          Buy MTN, Airtel, Glo and 9mobile data in seconds.
          Fast delivery, cheap prices and secure payments.
        </p>

        <div className="flex justify-center gap-6">

          <Link
            to="/signup"
            className="bg-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-700"
          >
            Create Account
          </Link>

          <Link
            to="/pricing"
            className="border border-white/20 px-8 py-4 rounded-xl"
          >
            View Prices
          </Link>

        </div>
      </section>

      {/* SERVICES WITH HUMAN IMAGES */}

      <section className="py-32 px-6">

        <h2 className="text-4xl font-black text-center mb-20">
          Our Services
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-y-24 gap-x-10">

          <ImageService
            title="Buy MTN Data"
            img="https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80"
          />

          <ImageService
            title="Airtel Data"
            img="https://images.unsplash.com/photo-1603575448878-868a20723f0d?auto=format&fit=crop&w=600&q=80"
          />

          <ImageService
            title="Glo Data"
            img="https://images.unsplash.com/photo-1607082352121-fa243f3dde32?auto=format&fit=crop&w=600&q=80"
          />

          <ImageService
            title="9mobile Data"
            img="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=600&q=80"
          />

          <ImageService
            title="Airtime Recharge"
            img="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=600&q=80"
          />

          <ImageService
            title="Cable TV Bills"
            img="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80"
          />

          <ImageService
            title="Electricity Payment"
            img="https://images.unsplash.com/photo-1581093458791-9d09d6b43b0b?auto=format&fit=crop&w=600&q=80"
          />

          <ImageService
            title="Instant Delivery"
            img="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=600&q=80"
          />

        </div>

      </section>

      {/* SPECIAL OFFER */}

      <section className="py-32 text-center bg-slate-900">

        <h2 className="text-5xl font-black mb-6">
          Special Offer
        </h2>

        <p className="text-3xl font-bold text-blue-500 mb-6">
          1GB MTN Data – ₦225
        </p>

        <p className="text-slate-400 mb-10">
          Instant delivery after purchase.
        </p>

        <Link
          to="/signup"
          className="bg-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-700"
        >
          Buy Now
        </Link>

      </section>

      {/* HOW IT WORKS */}

      <section className="py-32 px-6">

        <h2 className="text-4xl font-black text-center mb-20">
          How It Works
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">

          <Step
            number="1"
            title="Create Account"
            desc="Register and access your dashboard instantly."
          />

          <Step
            number="2"
            title="Fund Wallet"
            desc="Add money securely using bank transfer."
          />

          <Step
            number="3"
            title="Buy Services"
            desc="Purchase data, airtime or bills instantly."
          />

        </div>

      </section>

      <Footer />

    </div>
  );
};

export default LandingPage;



const ImageService = ({ title, img }: any) => {
  return (
    <div className="text-center group">

      <div className="flex justify-center mb-6">
        <img
          src={img}
          alt={title}
          className="w-40 object-contain group-hover:scale-110 transition duration-500"
        />
      </div>

      <h3 className="font-bold text-lg">
        {title}
      </h3>

    </div>
  );
};



const Step = ({ number, title, desc }: any) => {
  return (
    <div>

      <div className="text-blue-500 text-4xl font-black mb-4">
        {number}
      </div>

      <h3 className="text-xl font-bold mb-2">
        {title}
      </h3>

      <p className="text-slate-400">
        {desc}
      </p>

    </div>
  );
};