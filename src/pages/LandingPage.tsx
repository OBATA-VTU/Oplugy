import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import {
  Smartphone,
  Zap,
  ShieldCheck,
  Wallet,
  Wifi,
  Tv,
  Lightbulb
} from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white font-sans overflow-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Logo />

          <div className="hidden lg:flex gap-10 text-sm font-semibold">
            <a href="#services" className="text-slate-400 hover:text-white">Services</a>
            <a href="#why" className="text-slate-400 hover:text-white">Why Oplug</a>
            <a href="#how" className="text-slate-400 hover:text-white">How It Works</a>
            <Link to="/pricing" className="text-slate-400 hover:text-white">Pricing</Link>
          </div>

          <div className="flex gap-4">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm">
              Login
            </Link>

            <Link
              to="/signup"
              className="bg-blue-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>


      {/* HERO */}
      <section className="min-h-screen flex items-center pt-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">

          <div>
            <h1 className="text-6xl lg:text-7xl font-black leading-tight mb-6">
              Buy Data, Airtime<br />
              & Pay Bills <br />
              <span className="text-blue-500">Instantly.</span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-lg">
              Oplug is a fast VTU platform for buying cheap data, airtime,
              electricity bills and cable subscriptions in Nigeria.
            </p>

            <div className="flex gap-5 flex-wrap">
              <Link
                to="/signup"
                className="bg-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-500"
              >
                Create Account
              </Link>

              <Link
                to="/pricing"
                className="border border-white/10 px-8 py-4 rounded-full font-bold hover:bg-white/5"
              >
                View Data Prices
              </Link>
            </div>
          </div>

          {/* HERO IMAGE */}
          <motion.img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="mobile data purchase"
            className="w-[420px] object-contain mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          />

        </div>
      </section>


      {/* SPECIAL OFFER */}
      <section className="py-32 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          <motion.img
            src="https://cdn-icons-png.flaticon.com/512/2885/2885417.png"
            className="w-[360px] mx-auto object-contain"
          />

          <div>

            <p className="text-blue-500 font-bold uppercase tracking-widest mb-4">
              Limited Offer
            </p>

            <h2 className="text-5xl font-black mb-4">
              MTN 1GB Data
            </h2>

            <p className="text-6xl font-black text-blue-500 mb-6">
              ₦225
            </p>

            <p className="text-slate-400 mb-8">
              Buy MTN 1GB data instantly at a discounted rate.
              Delivery is automatic and takes only a few seconds.
            </p>

            <Link
              to="/signup"
              className="bg-blue-600 px-10 py-4 rounded-full font-bold hover:bg-blue-500"
            >
              Buy Now
            </Link>

          </div>
        </div>
      </section>


      {/* SERVICES */}
      <section id="services" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-5xl font-black text-center mb-24">
            Everything You Need
          </h2>

          <div className="grid md:grid-cols-3 gap-12">

            <Service icon={<Wifi size={30}/>} title="Buy Data"
            text="Purchase MTN, Airtel, Glo and 9mobile data bundles instantly."/>

            <Service icon={<Smartphone size={30}/>} title="Airtime Topup"
            text="Recharge airtime instantly for any Nigerian network."/>

            <Service icon={<Tv size={30}/>} title="Cable TV"
            text="Renew DSTV, GOTV and Startimes subscriptions."/>

            <Service icon={<Lightbulb size={30}/>} title="Electricity Bills"
            text="Pay electricity bills quickly from your wallet."/>

            <Service icon={<Wallet size={30}/>} title="Wallet Funding"
            text="Secure wallet funding via bank transfer and cards."/>

            <Service icon={<Zap size={30}/>} title="Instant Delivery"
            text="Most transactions are completed in under 5 seconds."/>

          </div>
        </div>
      </section>


      {/* WHY CHOOSE */}
      <section id="why" className="py-40 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">

          <div>

            <h2 className="text-5xl font-black mb-10">
              Why Choose Oplug
            </h2>

            <div className="space-y-8">

              <Feature
              icon={<Zap/>}
              title="Instant Delivery"
              text="Most purchases are delivered automatically in seconds."/>

              <Feature
              icon={<ShieldCheck/>}
              title="Secure Payments"
              text="Your wallet and transactions are fully protected."/>

              <Feature
              icon={<Wallet/>}
              title="Cheap Prices"
              text="Enjoy reseller-level data prices."/>

            </div>

          </div>

          <motion.img
            src="https://cdn-icons-png.flaticon.com/512/1256/1256650.png"
            className="w-[420px] mx-auto object-contain"
          />

        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="py-40 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-5xl font-black mb-24">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-20">

            <Step
            number="01"
            title="Create Account"
            text="Sign up and access your personal dashboard."/>

            <Step
            number="02"
            title="Fund Wallet"
            text="Add money through bank transfer or card."/>

            <Step
            number="03"
            title="Buy Services"
            text="Purchase data, airtime or pay bills instantly."/>

          </div>
        </div>
      </section>


      {/* RESELLER */}
      <section className="py-40 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">

          <motion.img
            src="https://cdn-icons-png.flaticon.com/512/2920/2920244.png"
            className="w-[420px] mx-auto object-contain"
          />

          <div>

            <h2 className="text-5xl font-black mb-8">
              Start Your VTU Business
            </h2>

            <p className="text-slate-400 mb-10">
              Become a reseller and start selling data, airtime and
              digital services to your customers.
            </p>

            <Link
            to="/signup"
            className="bg-blue-600 px-10 py-4 rounded-full font-bold hover:bg-blue-500">
            Start Reselling
            </Link>

          </div>
        </div>
      </section>


      {/* TRUST */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-16 text-center">

          <Stat number="5000+" label="Users"/>
          <Stat number="₦10M+" label="Transactions"/>
          <Stat number="99.9%" label="Uptime"/>
          <Stat number="24/7" label="Support"/>

        </div>
      </section>


      {/* FINAL CTA */}
      <section className="py-40 px-6 text-center">

        <h2 className="text-6xl font-black mb-10">
          Start Buying Data Instantly
        </h2>

        <p className="text-slate-400 mb-10">
          Join thousands of users already using Oplug.
        </p>

        <div className="flex justify-center gap-6 flex-wrap">

          <Link
          to="/signup"
          className="bg-blue-600 px-12 py-5 rounded-full font-bold hover:bg-blue-500">
          Get Started
          </Link>

          <a
          href="https://wa.me/2348142452729"
          className="border border-white/10 px-12 py-5 rounded-full font-bold hover:bg-white/5">
          Contact WhatsApp
          </a>

        </div>

      </section>

      <Footer />

    </div>
  );
};


/* COMPONENTS */

const Service = ({icon,title,text}:any)=>(
<div className="p-8 border border-white/5 rounded-3xl bg-slate-900/40">
<div className="text-blue-500 mb-4">{icon}</div>
<h3 className="text-xl font-bold mb-2">{title}</h3>
<p className="text-slate-400 text-sm">{text}</p>
</div>
)

const Feature = ({icon,title,text}:any)=>(
<div className="flex gap-4 items-start">
<div className="text-blue-500">{icon}</div>
<div>
<h3 className="font-bold text-lg">{title}</h3>
<p className="text-slate-400">{text}</p>
</div>
</div>
)

const Step = ({number,title,text}:any)=>(
<div>
<p className="text-blue-500 text-5xl font-black mb-4">{number}</p>
<h3 className="text-xl font-bold mb-2">{title}</h3>
<p className="text-slate-400">{text}</p>
</div>
)

const Stat = ({number,label}:any)=>(
<div>
<p className="text-4xl font-black text-blue-500">{number}</p>
<p className="text-slate-400">{label}</p>
</div>
)

export default LandingPage;