import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/client">
        <button>채팅 화면으로 이동</button>
      </Link>
    </div>
  );
}