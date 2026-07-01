import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../amplify/data/resource'

const client = generateClient<Schema>()

function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([])

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    })
    return () => sub.unsubscribe()
  }, [])

  function createTodo() {
    const content = window.prompt('Todo の内容')
    // NOTE: aws-amplify@6.18.0 + @aws-amplify/data-schema@1.26.0 の型不整合で
    // create() の入力型がインデックスシグネチャ（string[]）に退化するため as any で回避。
    // 実行時は正常。将来のバージョン整合が入れば as any は削除可。
    if (content) client.models.Todo.create({ content } as any)
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>＋ 新規追加</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
    </main>
  )
}

export default App