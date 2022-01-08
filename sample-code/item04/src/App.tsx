import Card from "./components/Card";

const blogResponseData = {
  title: "Effective TypeScript",
  content: "Understand TypeScript Compiler",
  thumbnail:
    "https://images.unsplash.com/photo-1641064926394-623e85a46b59?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2338&q=80",
  username: "David Thomas",
};

function App() {
  return (
    <div className="App">
      {/* Card Props에는 username이 없는데 에러가 없습니다! */}
      <Card {...blogResponseData} onClick={() => console.log("Click!!!")} />
    </div>
  );
}

export default App;
