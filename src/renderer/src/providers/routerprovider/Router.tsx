import Layout from "@renderer/components/Layout/Layout"
import ProtectedRoute from "@renderer/components/ProtectedRoute/ProtectedRoute"
import Attendance from "@renderer/pages/Attendances/Attendance"
import Dashboard from "@renderer/pages/Dashboard/Dashboard"
import CreateEmployee from "@renderer/pages/Employees/Create/Create"
import EditEmployee from "@renderer/pages/Employees/Edit/Edit"
import ListEmployee from "@renderer/pages/Employees/List/List"
import ShowEmployee from "@renderer/pages/Employees/Show/Show"
import Home from "@renderer/pages/Home/Home"
import Login from "@renderer/pages/Login/Login"
import Permissions from "@renderer/pages/Permissions/Permissions"
import Report from "@renderer/pages/Report/Report"
import ListSchedule from "@renderer/pages/Schedules/List/List"
import EditShift from "@renderer/pages/Shifts/Edit/Edit"
import ListShift from "@renderer/pages/Shifts/List/List"
import AssignTeam from "@renderer/pages/Teams/AssignTeam/AssignTeam"
import CreateTeam from "@renderer/pages/Teams/Create/Create"
import EditTeam from "@renderer/pages/Teams/Edit/Edit"
import ListTeam from "@renderer/pages/Teams/List/List"
import ShowTeam from "@renderer/pages/Teams/Show/Show"
import CreateUser from "@renderer/pages/users/Create/Create"
import EditUser from "@renderer/pages/users/Edit/Edit"
import ListUser from "@renderer/pages/users/List/List"
import ShowUser from "@renderer/pages/users/Show/Show"


import { createHashRouter, Navigate, RouterProvider } from "react-router"


const router = createHashRouter([
    {
        element: <Layout />,
        children: [
            { path: "/", element: <Navigate to="/home" replace /> },
            { path: "/login", element: <Login /> },
            { path: "*", element: <Navigate to="/home" replace /> },
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "/home", element: <Home /> },
                    { path: "/users", element: <ListUser /> },
                    { path: "/users/create", element: <CreateUser /> },
                    { path: "/users/:id", element: <ShowUser /> },
                    { path: "/users/edit/:id", element: <EditUser /> },
                    { path: "/shifts", element: <ListShift /> },
                    { path: "/shifts/edit/:id", element: <EditShift /> },
                    { path: "/employees", element: <ListEmployee /> },
                    { path: "/employees/:id", element: <ShowEmployee /> },
                    { path: "/employees/edit/:id", element: <EditEmployee /> },
                    { path: "/employees/create", element: <CreateEmployee /> },
                    { path: "/teams", element: <ListTeam /> },
                    { path: "/teams/create", element: <CreateTeam /> },
                    { path: "/teams/:id", element: <ShowTeam /> },
                    { path: "/teams/assign/:id", element: <AssignTeam /> },
                    { path: "/teams/edit/:id", element: <EditTeam /> },
                    { path: "/permissions", element: <Permissions /> },
                    { path: "/schedules", element: <ListSchedule /> },
                    { path: "/attendances", element: <Attendance /> },
                    { path: "/report", element: <Report /> },
                    { path: "/dashboard", element: <Dashboard /> },
                ],
            },
        ],
    },
])

const Router = () => <RouterProvider router={router} />

export default Router