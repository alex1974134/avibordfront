import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'
import { useAppStore } from '../../store/useAppStore'
import { filterByQuery } from '../../utils/search'

export function SearchField({ autoFocus = false }: { autoFocus?: boolean }) {
  const navigate = useNavigate()
  const query = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const workspaceId = useAppStore((state) => state.workspaceId)
  const projects = useAppStore((state) => state.projects)
  const tasks = useAppStore((state) => state.tasks)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useDismiss(open, ref, () => setOpen(false))

  const needle = query.trim()
  const projectHits = filterByQuery(
    projects.filter((project) => project.workspaceId === workspaceId),
    needle,
    (project) => `${project.name} ${project.description}`,
  ).slice(0, 4)
  const taskHits = filterByQuery(
    tasks.filter((task) => task.workspaceId === workspaceId),
    needle,
    (task) => task.title,
  ).slice(0, 6)
  const showPanel = open && needle.length > 0

  return (
    <div ref={ref} className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
      <input
        ref={inputRef}
        type="search"
        data-search="workspace"
        value={query}
        autoFocus={autoFocus}
        aria-label="Поиск проектов и задач"
        placeholder="Поиск проектов и задач"
        onChange={(event) => {
          setSearchQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        className="h-8 w-full rounded-lg border border-line bg-white pr-16 pl-8 text-sm outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {query ? (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => {
            setSearchQuery('')
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-faint hover:bg-zinc-100 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-[10px] text-faint sm:inline">
          Ctrl K
        </kbd>
      )}
      {showPanel ? (
        <div className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 max-h-80 overflow-auto rounded-xl border border-line bg-white p-1.5 shadow-lg">
          {projectHits.length === 0 && taskHits.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">Ничего не найдено.</p>
          ) : null}
          {projectHits.length > 0 ? (
            <div className="mb-1">
              <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">Проекты</p>
              {projectHits.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(project.name)
                    setOpen(false)
                    navigate('/projects')
                  }}
                  className="flex w-full cursor-pointer flex-col rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
                >
                  <span className="text-sm font-medium text-ink">{project.name}</span>
                  <span className="truncate text-xs text-faint">{project.description}</span>
                </button>
              ))}
            </div>
          ) : null}
          {taskHits.length > 0 ? (
            <div>
              <p className="px-2 py-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">Задачи</p>
              {taskHits.map((task) => {
                const project = projects.find((item) => item.id === task.projectId)
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery(task.title)
                      setOpen(false)
                      navigate('/tasks')
                    }}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-2 py-2 text-left hover:bg-zinc-50"
                  >
                    <span className="text-sm font-medium text-ink">{task.title}</span>
                    <span className="truncate text-xs text-faint">{project?.name}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
