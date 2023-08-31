import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTask, deleteTask, getTasks, patchTask } from '../api/tasks-api'
import Auth from '../auth/Auth'
import { Task } from '../types/Task'
import LoadingOverlay from 'react-loading-overlay'
import BounceLoader from 'react-spinners/BounceLoader'
import styled from 'styled-components'

interface TasksProps {
  auth: Auth
  history: History
}

interface TasksState {
  tasks: Task[]
  newTaskName: string
  loadingTasks: boolean
  isLoading: boolean
}

export class Tasks extends React.PureComponent<TasksProps, TasksState> {
  state: TasksState = {
    tasks: [],
    newTaskName: '',
    loadingTasks: true,
    isLoading: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTaskName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTaskCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      this.setState({
        isLoading: true
      })
      const dueDate = this.calculateDueDate()
      const newTask = await createTask(this.props.auth.getIdToken(), {
        name: this.state.newTaskName,
        dueDate
      })
      if (!newTask.name) {
        return
      }
      this.setState({
        tasks: [...this.state.tasks, newTask],
        newTaskName: '',
        isLoading: false
      })
    } catch {
      alert('Task creation failed')
    }
  }

  onTaskDelete = async (todoId: string) => {
    try {
      this.setState({
        isLoading: true
      })
      await deleteTask(this.props.auth.getIdToken(), todoId)
      this.setState({
        tasks: this.state.tasks.filter((todo) => todo.todoId !== todoId),
        isLoading: false
      })
    } catch {
      alert('Task deletion failed')
    }
  }

  onTaskCheck = async (pos: number) => {
    try {
      const todo = this.state.tasks[pos]
      await patchTask(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        tasks: update(this.state.tasks, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Task deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const tasks = await getTasks(this.props.auth.getIdToken())
      this.setState({
        tasks,
        loadingTasks: false
      })
    } catch (e) {
      alert(`Failed to fetch tasks: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <LoadingOverlay
        active={this.state.isLoading}
        spinner={<BounceLoader />}
        styles={{
          overlay: (base) => ({
            ...base,
            width: '100vw',
            height: '100vh',
            top: 0,
            left: 0,
            position: 'fixed'
          })
        }}
      >
        <div>
          <Header as="h1">List TASK</Header>

          {this.renderCreateTaskInput()}

          {this.renderTasks()}
        </div>
      </LoadingOverlay>
    )
  }

  renderCreateTaskInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTaskCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTasks() {
    if (this.state.loadingTasks) {
      return this.renderLoading()
    }

    return this.renderTasksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TASKS
        </Loader>
      </Grid.Row>
    )
  }

  renderTasksList() {
    return (
      <Grid padded>
        {this.state.tasks.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTaskCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTaskDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
