import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Table, Button } from 'reactstrap';
import { Popconfirm, message, Select, Icon } from 'antd'

import AddUser from './addUser';
import EditUser from './editUser';

const Option = Select.Option;
const entries = [5, 10, 25, 50];
const COUNT_USERS = gql`
    query count{
	    countUsers
    }`

const GET_USERS = gql`
            query getUsers($sorting: String!, $numOfRecords: Int!, $pageNum: Int!, $sortColumn: String!){
                    users(sorting:$sorting, numOfRecords: $numOfRecords, pageNum: $pageNum, sortColumn: $sortColumn){
                        id,
                        name,
                        gender,
                        email
                }
            }`
const DELETE_USER = gql`
    mutation deleteUserById($id:Int!) {
        deleteUser(id:$id){
                id,
                name,
                gender,
                email
            }
        }`

class users extends Component {

    state = {
        addModal: false,
        editModal: false,
        editUser: {},
        pagination: {
            sorting: 'ASC',
            numOfRecords: 5,
            pageNum: 1,
            sortColumn: 'name'
        }
    }
    next = (pages) => {
        let { pagination } = this.state;
        let { pageNum } = pagination;
        if (pageNum < pages) {
            this.setState({ pagination: { ...pagination, pageNum: pageNum + 1 } })
        }
    }
    prev = () => {
        let { pagination } = this.state;
        let { pageNum } = pagination;
        if (pageNum !== 1) {
            this.setState({ pagination: { ...pagination, pageNum: pageNum - 1 } })
        }
    }
    sort = (sortColumn) => {
        let { pagination } = this.state;
        let { sorting } = pagination;
        if (sorting === 'ASC') {
            this.setState({
                pagination: {
                    ...pagination,
                    sorting: 'DESC',
                    sortColumn: sortColumn
                }
            })
        }
        else {
            this.setState({
                pagination: {
                    ...pagination,
                    sorting: 'ASC',
                    sortColumn: sortColumn
                }
            })
        }
    }
    deleteSuccess = (len) => {
        let { pageNum } = this.state.pagination;
        if (len === 0) {
            pageNum = pageNum - 1;
            this.setState({ pagination: { ...this.state.pagination, pageNum } });
        }
        message.success("The user was deleted successfully", 3)
    }
    handleEntryChange = (e) => {
        this.setState({ pagination: { ...this.state.pagination, numOfRecords: e, pageNum: 1 } })
    }
    toggleAdd = () => {
        this.setState(prevState => { return { addModal: !prevState.addModal } })
    }
    toggleEdit = () => {
        this.setState(prevState => { return { editModal: !prevState.editModal } })
    }
    handlePageChange = (pageNum) => {
        this.setState({ pagination: { ...this.state.pagination, pageNum: parseInt(pageNum, 10) } })
    }
    render() {
        debugger;
        let len;
        let { sortColumn, numOfRecords, sorting, pageNum } = this.state.pagination;
        let options = entries.map((entry, i) => {
            return <Option key={i} value={parseInt(entry, 10)}>{entry}</Option>
        })
        return (
            <div style={{ padding: "20px" }}>
                <AddUser isOpen={this.state.addModal} toggle={this.toggleAdd} query={{ GET_USERS, COUNT_USERS }} pagination={this.state.pagination} />
                <EditUser isOpen={this.state.editModal} toggle={this.toggleEdit} query={GET_USERS} user={this.state.editUser} pagination={this.state.pagination} />
                <div style={{ margin: "5px" }}>
                    <Button color="info" onClick={this.toggleAdd} style={{ marginBottom: '5px' }}>Add User</Button>
                    <div style={{ float: 'right', marginRight: '15px' }}>
                        Number of entries to display:
                        <Select defaultValue={5} style={{ width: '120px', marginLeft: '5px' }} onChange={this.handleEntryChange}>
                            {options}
                        </Select>
                    </div>
                </div>
                <Table dark style={{ textAlign: "center" }}>
                    <thead>
                        <tr><th colSpan={5}><u>User Table</u></th></tr>
                        <tr>
                            <th>#</th>
                            <th style={{ cursor: "pointer" }} onClick={() => this.sort("name")}>Name {(sortColumn === 'name') ? ((sorting === 'ASC') ? <Icon style={{ fontSize: "9px" }} type="caret-up" /> : <Icon style={{ fontSize: "9px" }} type="caret-down" />) : null}</th>
                            <th style={{ cursor: "pointer" }} onClick={() => this.sort("email")}>Email {(sortColumn === 'email') ? ((sorting === 'ASC') ? <Icon style={{ fontSize: "9px" }} type="caret-up" /> : <Icon style={{ fontSize: "9px" }} type="caret-down" />) : null}</th>
                            <th>Gender</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <Query query={GET_USERS} variables={{ ...this.state.pagination }}>
                            {({ loading, error, data }) => {
                                if (loading) return <tr><td colSpan={5}>Loading...</td></tr>;
                                if (error) return <tr><td style={{ backgroundColor: "firebrick", color: "white" }} colSpan={5}>Unable to load data. Try again later.</td></tr>;
                                if (data.users.length === 0)
                                    return <tr><td style={{ backgroundColor: "grey", color: "white" }} colSpan={5}>There is no data to display.</td></tr>
                                return data.users.map((user, i) => {
                                    return (<tr key={user.id}>
                                        <td>{i + 1 + numOfRecords * (pageNum - 1)}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.gender}</td>
                                        <td>
                                            <Button color="info" onClick={() => this.setState({ editUser: { ...user }, editModal: true })}>Edit</Button>{" "}
                                            <Mutation mutation={DELETE_USER} onCompleted={() => this.deleteSuccess(len)} variables={{ id: parseInt(user.id, 10) }}
                                                update={(cache, { data: { deleteUser } }) => {
                                                    let { users } = cache.readQuery({ query: GET_USERS, variables: { ...this.state.pagination } });
                                                    const { countUsers } = cache.readQuery({ query: COUNT_USERS })
                                                    users = users.filter(user => parseInt(user.id, 10) !== parseInt(deleteUser.id, 10));
                                                    len = users.length;
                                                    cache.writeQuery({
                                                        query: GET_USERS,
                                                        data: { users: users },
                                                        variables: { sortColumn, numOfRecords, sorting, pageNum }
                                                    });
                                                    cache.writeQuery({
                                                        query: COUNT_USERS,
                                                        data: { countUsers: countUsers - 1 }
                                                    })
                                                }}
                                            >
                                                {
                                                    deleteUser => {
                                                        return (
                                                            <Popconfirm title="Are you sure you want to delete this user" onConfirm={deleteUser} okText="Yes" cancelText="No">
                                                                <Button id="delete-btn" color="danger">Delete</Button>
                                                            </Popconfirm>)
                                                    }
                                                }
                                            </Mutation>
                                        </td>
                                    </tr>)
                                })
                            }}
                        </Query>
                    </tbody>
                </Table>
                <div style={{ float: "right", marginRight: '12px' }}>
                    <Query query={COUNT_USERS}>
                        {({ loading, error, data }) => {
                            let btn = {
                                height: '38px', width: '37px', marginRight: "2px", border: "2px solid #17a2b8"
                            };
                            if (loading) return null;
                            if (error) return null;
                            let recCount = data.countUsers;
                            let buttons = [];
                            let pages = Math.ceil(recCount / numOfRecords);
                            let pageCount = new Array(pages + 2).fill('a');
                            buttons = pageCount.map((_, i) => {
                                if (i === 0) return <Button hidden={pageNum === 1} style={{ ...btn, backgroundColor: '#17a2b8' }} key={i} onClick={this.prev}>{"<"}</Button>
                                if (i === pageCount.length - 1) return <Button hidden={pageNum === pages} key={i} style={{ ...btn, backgroundColor: '#17a2b8' }} onClick={() => this.next(pages)}>{">"}</Button>
                                return <Button onClick={() => this.handlePageChange(i)} style={{ ...btn, backgroundColor: (pageNum === i) ? "white" : "#17a2b8", color: (pageNum === i) ? "#17a2b8" : "white" }} key={i}>{i}</Button>
                            })
                            if (numOfRecords >= recCount) {
                                buttons = [];
                            }
                            return buttons;
                        }}
                    </Query>
                </div>
            </div >
        );
    }
}

export default users;