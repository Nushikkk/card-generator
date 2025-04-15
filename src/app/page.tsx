"use client";

import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  return (
    <div className="bg-photo-home" style={{ height: "100vh" }}>
      <button
        className="btn position-absolute mt-3 text-white"
        style={{
          top: "160px",
          left: "60px",
          borderRadius: 50,
          width: "200px",
          background: "linear-gradient(90deg, #38546c 0%, #00bafd 100%)",
          border: "none",
        }}
        onClick={() => router.push("/editor")}
      >
        C R E A T E
      </button>
    </div>
  );
};

export default Home;
