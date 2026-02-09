"use client";

export default function SuccessLoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce4ec, #fff, #f3e5f5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 60,
          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            margin: "0 auto",
            border: "8px solid #e5e7eb",
            borderTop: "8px solid #ff6b9d",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginTop: 30,
            color: "#1a1a1a",
          }}
        >
          Cargando...
        </h1>
        <p style={{ color: "#6b7280", marginTop: 10 }}>
          Por favor espera un momento
        </p>

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
