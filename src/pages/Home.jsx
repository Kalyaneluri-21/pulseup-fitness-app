import { useSelector } from "react-redux"
import Header from "../components/Header";
const Home = () => {
  const theme = useSelector((state)=>state.theme.theme);
  
  return (
    <div>
      <Header/>
    </div>
  )
}

export default Home