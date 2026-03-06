import React from "react";
import Logo from "../components/Logo";

const ImageService = ({ title, img }: any) => (
  <div className="text-center group">
    <div className="flex justify-center mb-6">
      <img
        src={img}
        alt={title}
        className="w-40 object-contain group-hover:scale-110 transition duration-500"
      />
    </div>

    <h3 className="text-lg font-bold text-white">{title}</h3>
  </div>
);

const LandingPage = () => {
  return (
    <div className="bg-black text-white">

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-4xl">

          <div className="flex justify-center mb-8">
            <Logo className="h-14 w-auto"/>
          </div>

          <h1 className="text-6xl font-black mb-6">
            Nigeria’s Fastest VTU Platform
          </h1>

          <p className="text-xl opacity-80 mb-10">
            Buy Cheap Data, Airtime, Pay Bills Instantly. Reliable automated
            VTU platform for everyone.
          </p>

          <div className="text-3xl font-bold text-green-400 mb-12">
            Special Offer — 1GB MTN @ ₦225
          </div>

          <a
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-xl text-lg font-bold transition"
          >
            Get Started
          </a>

        </div>
      </section>

      {/* SERVICES */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-5xl font-black text-center mb-24">
            Our Services
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-24 gap-x-10 items-center">

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
              title="Instant Airtime"
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
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-40 px-6 bg-neutral-950">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-5xl font-black text-center mb-24">
            Why Choose Oplug
          </h2>

          <div className="grid md:grid-cols-3 gap-16 text-center">

            <div>
              <h3 className="text-2xl font-bold mb-4">Instant Delivery</h3>
              <p className="opacity-70">
                All transactions are processed instantly with automated
                infrastructure.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">Cheap Data</h3>
              <p className="opacity-70">
                Enjoy highly discounted data bundles for all networks.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">Secure Payments</h3>
              <p className="opacity-70">
                All payments are protected with industry-level encryption.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-5xl font-black text-center mb-24">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-16 text-center">

            <div>
              <div className="text-5xl font-black mb-6 text-blue-500">1</div>
              <h3 className="text-xl font-bold mb-3">Create Account</h3>
              <p className="opacity-70">
                Register in seconds and gain access to the dashboard.
              </p>
            </div>

            <div>
              <div className="text-5xl font-black mb-6 text-blue-500">2</div>
              <h3 className="text-xl font-bold mb-3">Fund Wallet</h3>
              <p className="opacity-70">
                Deposit money easily using automated payment methods.
              </p>
            </div>

            <div>
              <div className="text-5xl font-black mb-6 text-blue-500">3</div>
              <h3 className="text-xl font-bold mb-3">Buy Services</h3>
              <p className="opacity-70">
                Purchase data, airtime and bills instantly.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-40 text-center px-6 bg-blue-600">

        <h2 className="text-5xl font-black mb-8">
          Start Using Oplug Today
        </h2>

        <p className="text-xl mb-12">
          Join hundreds of users buying cheap data every day.
        </p>

        <a
          href="/register"
          className="bg-white text-black px-10 py-4 rounded-xl font-bold text-lg"
        >
          Create Account
        </a>

      </section>

      {/* FOOTER */}
      <footer className="py-14 text-center opacity-60 text-sm">
        © {new Date().getFullYear()} Oplug VTU
      </footer>

    </div>
  );
};

export default LandingPage;