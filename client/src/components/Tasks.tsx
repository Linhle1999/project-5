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

import {
  createTask,
  deleteTask,
  getTasks,
  getUploadUrl,
  patchTask,
  uploadFile
} from '../api/tasks-api'
import Auth from '../auth/Auth'
import { Task } from '../types/Task'
import LoadingOverlay from 'react-loading-overlay'
import BounceLoader from 'react-spinners/BounceLoader'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import styled from 'styled-components'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

const ContainerStyled = styled('div')`
  position: relative;
  cursor: pointer;
  .test-button {
    display: none;
    margin: auto;
  }

  &:hover {
    img {
      opacity: 0.3;
      filter: brightness(0.4);
    }
    .test-button {
      display: block;
    }
  }  
}`

const ButtonStyled = styled(Button)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  width: fit-content;
  height: 40px;
`
interface TasksProps {
  auth: Auth
  history: History
}

interface TasksState {
  tasks: Task[]
  newTaskName: string
  loadingTasks: boolean
  isLoading: boolean
  openDialogAdd: boolean
  imageUrl: string | ArrayBuffer | null
  imageFile: Buffer | undefined
  openSnackbar: boolean
  currentTaskId: string | undefined
}

export class Tasks extends React.PureComponent<TasksProps, TasksState> {
  state: TasksState = {
    tasks: [],
    newTaskName: '',
    loadingTasks: true,
    isLoading: false,
    openDialogAdd: false,
    imageUrl: null,
    imageFile: undefined,
    openSnackbar: false,
    currentTaskId: undefined
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTaskName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTaskCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    this.handleClickOpen()
    // try {
    //   this.setState({
    //     isLoading: true
    //   })
    //   const dueDate = this.calculateDueDate()
    //   const newTask = await createTask(this.props.auth.getIdToken(), {
    //     name: this.state.newTaskName,
    //     dueDate
    //   })
    //   if (!newTask.name) {
    //     return
    //   }
    // const uploadUrl = await getUploadUrl(
    //   this.props.auth.getIdToken(),
    //   newTask.id
    // )
    //   this.setState({
    //     tasks: [...this.state.tasks, newTask],
    //     newTaskName: '',
    //     isLoading: false
    //   })
    // } catch {
    //   alert('Task creation failed')
    // }
  }

  handleClickOpen = () => {
    this.setState({ openDialogAdd: true })
  }

  handleClose = () => {
    this.setState({ openDialogAdd: false })
  }

  handleFileUpload = async (event: any, todo?: Task) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    this.setState({ imageFile: file })
    reader.onloadend = () => {
      this.setState({ imageUrl: reader.result })
    }

    reader.readAsDataURL(file)
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
      // alert(`Failed to fetch tasks: ${(e as Error).message}`)
    }
  }

  handleClinkOk = async () => {
    try {
      if (this.state.currentTaskId) {
        this.setState({
          isLoading: true
        })
        const uploadUrl = await getUploadUrl(
          this.props.auth.getIdToken(),
          this.state.currentTaskId
        )
        if (this.state.imageFile)
          await uploadFile(uploadUrl, this.state.imageFile)

        const tasks = this.state.tasks
        const index = tasks.findIndex(
          (task) => task.todoId === this.state.currentTaskId
        )
        tasks[
          index
        ].attachmentUrl = `https://project-4-bucket-dev.s3.amazonaws.com/${
          this.state.currentTaskId
        }?t=${new Date().getTime()}`

        this.setState({
          tasks: tasks,
          isLoading: false,
          currentTaskId: undefined,
          openDialogAdd: false
        })

        return
      }
    } catch (error) {}
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
      const uploadUrl = await getUploadUrl(
        this.props.auth.getIdToken(),
        newTask.todoId
      )
      if (this.state.imageFile)
        await uploadFile(uploadUrl, this.state.imageFile)
      newTask.attachmentUrl = `https://project-4-bucket-dev.s3.amazonaws.com/${
        newTask.todoId
      }?t=${new Date().getTime()}`
      this.setState({
        tasks: [...this.state.tasks, newTask],
        newTaskName: '',
        isLoading: false,
        openDialogAdd: false
      })
    } catch {
      this.setState({
        openSnackbar: true,
        isLoading: false,
        openDialogAdd: false
      })
    }
  }

  handleCloseSnack = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    this.setState({
      openSnackbar: false
    })
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
            position: 'fixed',
            zIndex: '9999'
          })
        }}
      >
        <Dialog
          open={this.state.openDialogAdd}
          onClose={this.handleClose}
          maxWidth="sm"
          fullWidth={true}
        >
          <DialogTitle>
            {this.state.currentTaskId ? 'Edit' : 'Add'} task
          </DialogTitle>
          <DialogContent>
            {this.state.currentTaskId ? (
              ''
            ) : (
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Task name"
                type="text"
                fullWidth
                onChange={this.handleNameChange}
                variant="standard"
              />
            )}
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={this.handleFileUpload}
                />
                <PhotoCamera />
              </IconButton>
              {this.state.imageUrl && (
                <img
                  src={this.state.imageUrl.toString()}
                  alt="Uploaded Image"
                  height="300"
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Cancel</Button>
            <Button onClick={this.handleClinkOk}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={this.state.openSnackbar}
          autoHideDuration={1000}
          onClose={this.handleCloseSnack}
        >
          <Alert
            onClose={this.handleCloseSnack}
            severity="error"
            sx={{ width: '100%' }}
          >
            Task creation failed
          </Alert>
        </Snackbar>

        <div>
          <Header as="h1">TASKs</Header>

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
          <Button
            onClick={() => {
              this.handleClickOpen()
              this.setState({ currentTaskId: undefined })
            }}
          >
            New task
          </Button>
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
          Loading TASKs
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
                <ContainerStyled
                  onClick={() => {
                    this.handleClickOpen()
                    this.setState({ currentTaskId: todo.todoId })
                  }}
                >
                  <Card sx={{ minWidth: 200 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={todo.attachmentUrl}
                      alt="todo.attachmentUrl"
                    />
                  </Card>
                  <ButtonStyled
                    variant="contained"
                    className="test-button"
                    onClick={() => {
                      this.handleClickOpen()
                      this.setState({ currentTaskId: todo.todoId })
                    }}
                  >
                    Upload Image
                  </ButtonStyled>
                </ContainerStyled>
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
