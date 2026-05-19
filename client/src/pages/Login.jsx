import React from "react";

const Login = () => {
  return (
    <div
      style={{ padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h2>Login</h2>
      <form>
        <div>
          <label>Email:</label>
          <br />
          <input type="email" />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Password:</label>
          <br />
          <input type="password" />
        </div>
        <button style={{ marginTop: "1rem" }} type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
