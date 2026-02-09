"use client";

export default function CheckoutLoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce4ec, #fff, #f3e5f5)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 60,
          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            margin: "0 auto",
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #ff6b9d",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: 20, color: "#4b5563" }}>Cargando...</p>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
