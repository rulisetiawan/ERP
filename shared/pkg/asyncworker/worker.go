package asyncworker

import (
	"log"
	"sync"
	"time"
)

// AsyncTask represents a generic background function to be executed in a Goroutine
type AsyncTask struct {
	ID        string
	Name      string
	TaskFunc  func() error
	CreatedAt time.Time
}

// WorkerPool manages Goroutine worker pool with buffered channel
type WorkerPool struct {
	taskQueue   chan AsyncTask
	workerCount int
	wg          sync.WaitGroup
	quit        chan struct{}
}

var globalPool *WorkerPool
var once sync.Once

// InitGlobalWorkerPool initializes the shared background Goroutine worker pool
func InitGlobalWorkerPool(workerCount, queueSize int) *WorkerPool {
	once.Do(func() {
		globalPool = &WorkerPool{
			taskQueue:   make(chan AsyncTask, queueSize),
			workerCount: workerCount,
			quit:        make(chan struct{}),
		}
		globalPool.start()
	})
	return globalPool
}

// GetGlobalWorkerPool returns singleton worker pool
func GetGlobalWorkerPool() *WorkerPool {
	if globalPool == nil {
		return InitGlobalWorkerPool(5, 500)
	}
	return globalPool
}

func (wp *WorkerPool) start() {
	log.Printf("[GOROUTINE WORKER POOL] Starting %d background worker goroutines...", wp.workerCount)
	for i := 1; i <= wp.workerCount; i++ {
		wp.wg.Add(1)
		go wp.workerLoop(i)
	}
}

func (wp *WorkerPool) workerLoop(workerID int) {
	defer wp.wg.Done()
	for {
		select {
		case task, ok := <-wp.taskQueue:
			if !ok {
				log.Printf("[GOROUTINE WORKER #%d] Task queue closed, exiting worker loop.", workerID)
				return
			}
			start := time.Now()
			log.Printf("[GOROUTINE WORKER #%d] Executing async task '%s' (ID: %s)...", workerID, task.Name, task.ID)
			if err := task.TaskFunc(); err != nil {
				log.Printf("[GOROUTINE WORKER #%d] ERROR in async task '%s' (ID: %s): %v", workerID, task.Name, task.ID, err)
			} else {
				log.Printf("[GOROUTINE WORKER #%d] COMPLETED task '%s' (ID: %s) in %v", workerID, task.Name, task.ID, time.Since(start))
			}
		case <-wp.quit:
			log.Printf("[GOROUTINE WORKER #%d] Received quit signal, stopping worker.", workerID)
			return
		}
	}
}

// SubmitAsync enqueues an asynchronous task to be executed by a Goroutine worker
func (wp *WorkerPool) SubmitAsync(name string, taskFunc func() error) {
	task := AsyncTask{
		ID:        time.Now().Format("20060102150405.000000"),
		Name:      name,
		TaskFunc:  taskFunc,
		CreatedAt: time.Now(),
	}

	select {
	case wp.taskQueue <- task:
		log.Printf("[GOROUTINE DISPATCH] Async task '%s' queued successfully.", name)
	default:
		log.Printf("[GOROUTINE WARNING] Queue full! Spawning emergency fallback goroutine for '%s'...", name)
		go func(t AsyncTask) {
			if err := t.TaskFunc(); err != nil {
				log.Printf("[EMERGENCY GOROUTINE ERROR] Task '%s' failed: %v", t.Name, err)
			}
		}(task)
	}
}

// Stop gracefully shuts down all worker goroutines
func (wp *WorkerPool) Stop() {
	close(wp.quit)
	close(wp.taskQueue)
	wp.wg.Wait()
	log.Println("[GOROUTINE WORKER POOL] All background worker goroutines stopped gracefully.")
}
