import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './views/pages/Home'
import UploadedData from './views/pages/UploadedData'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/data" element={<UploadedData />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
