// million-ignore
import { useState } from "react"
const App = () => {
  const [js, setJs] = useState("")

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
      </head>
      <body>
        <script>
          ${js}
        </script>
      </body>
    </html>
  ` 

  return (
    <div>
      <input type="text" value={js} onChange={(evt) => setJs(evt.target.value)} /> 
      <iframe srcDoc={htmlTemplate} />
    </div>
  )
}

export default App  