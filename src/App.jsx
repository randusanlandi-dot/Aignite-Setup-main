import  React from 'react'

function App() {
  const [tasks, setTasks] = React.useState([
           { name: 'Calculus Class', date: '30 February 2025', time: '11:00 PM', status: 'Active', completed: false },
      { name: 'Physics Class', date: '30 February 2025', time: '10:00 PM', status: 'Active', completed: false },
      { name: 'Meeting with Lecturer', date: '30 February 2025', time: '11:00 PM', status: 'Active', completed: false }
        ])
        const toggleComplete = (index) => {
  const updatedTasks = [...tasks]
  updatedTasks[index].completed = !updatedTasks[index].completed
  setTasks(updatedTasks)
}

  return (
    <div className='flex justify-center w-full min-h-screen text-white font-zzz bg-cover bg-center'
     style={{backgroundImage: "url('/assets/bg.png')"}}>
      <header className='absolute top-0 text-cl p-5 bg-black w-full text-center rounded-lg font-myfont'>
      KT's To-Do List

      {/*This is a triangle*/}
      <div className="absolute top-0 left-0 w-0 h-0 border-l-[200px] border-b-[200px] border-l-transparent border-b-rose-900 rotate-180"></div>
      {/* Logo on top */}
<img
  src="/assets/funnyshark.png"
  alt="Logo"
  className="absolute top-[55px] left-[55px] w-24 h-24 transform -translate-x-1/2 -translate-y-1/2"
/>
</header>

      <main className='pt-36 w-3/4'>
      {/*User Prompt*/}
      <div className='flex justify-center'>
        <input className='bg-black/60 p-4 rounded-2x1 w-3/4 shadow-md'>
        </input>
        <button className='pl-2 h-12 pt-2'>
          <img src='/assets/funnyshark.png' alt="enter" className='w-full h-full'/>
          
        </button>
      </div>

      {/* Spacing */}
      <div className='p-6'>

      {/* To-Do List*/}
      <div className='space-y-4'>
  {tasks.map((task, index) => (
    <div
      key={index}
      className={`rounded-xl overflow-hidden shadow-md bg-black/60`}
    >
      {/* Top Bar (with checkbox + name) */}
      <div className={`px-4 py-2 flex items-center gap-2 
        ${task.completed ? 'bg-rose-950/70' : 'bg-rose-900'}`}>
        
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(index)}
          className="w-4 h-4"
        />

        <h2 className={`text-lg font-bold 
          ${task.completed ? 'line-through opacity-50' : ''}`}>
          {task.name}
        </h2>
      </div>

      {/* Bottom Content */}
      <div className={`px-4 py-3 ${task.completed ? 'line-through opacity-50' : ''}`}>
        <p>{task.date} — {task.time}</p>
        <p className={`${task.completed ? 'text-red-500' : 'text-green-400'}`}>
  {task.completed ? 'Inactive' : 'Active'}
</p>
      </div>
    </div>
  ))}
</div>

{/*This is real funny guys*/}
<img src="/assets/orphie2.png" alt="Orpheus" className="fixed bottom-[81px] left-10 w-[250px] h-[250px] z-20" />
<div
  className="fixed bottom-[75px] left-0 w-[450px] h-[150px] z-10
             [clip-path:polygon(0px_0px,300px_0px,450px_150px,300px_150px,0px_150px)]
             bg-black/60 flex flex-col justify-end"
>
  <div className="w-full bg-rose-900 overflow-hidden z-30">
    <div className="marquee whitespace-nowrap text-white px-4 py-2">
      "Tugas yang baik adalah tugas yang dikumpulkan."
    </div>
    


  </div>
</div>


      </div>
      </main>
    </div>
  )
}

export default App