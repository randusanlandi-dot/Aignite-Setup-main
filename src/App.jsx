import  React from 'react'

function App() {
  return (
    <div className='flex justify-center w-full min-h-screen bg-gray-800 text-white'>
      <header className='absolute top-0 text-cl p-5 bg-gray-600 w-full text-center rounded-lg'>
      To-Do List App
      </header>

      <main className='pt-36 w-3/4'>
      {/*User Prompt*/}
      <div className='flex justify-center'>
        <input className='bg-slate-700 p-4 rounded-2x1 w-3/4 shadow-md'>
        </input>
        <button className='pl-2 h-12 pt-2'>
          <img src='/usagsmart.png' alt="enter" className='w-full h-full'/>
          
        </button>
      </div>

      {/* Spacing */}
      <div className='p-6'>

      {/* To-Do List*/}
      </div>
      <div className='flex justify-center'>
      <div className='bg-blue-500 p-4 rounded-2x1 w-3/4 shadow-md'>
        <p>Work on assignments</p>
      </div>
      </div>
      </main>
    </div>
  )
}

export default App