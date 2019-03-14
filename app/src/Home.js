import React, { Component } from 'react';
import axios from 'axios'

class Home extends Component {
    constructor(props){
        super(props)
        this.state = {
            categories:[],
            ips_list:[],
            category_value: '',
            selected_category: '',
        }
    }
    componentWillMount = () => {
        axios.get('http://localhost:8486/items-list/')
        .then(response => {
            this.setState({
                categories: response.data.categories,
                ips_list: response.data.ips_list,
            })
        })
    }
    addCategory = (e) => {
        this.setState(previousState => ({
            categories: [...previousState.categories,{name: this.state.category_value}]
        }))
        axios.get('http://localhost:8486/add-category/',{
            params:{
                name: this.state.category_value
            }
        })
    }
    addHost = (category) => {
        this.setState(previousState => ({
            ips_list: [...previousState.ips_list,{name: this.state.host_value, category: category}]
        }))
        axios.get('http://localhost:8486/add-ips/',{
            params:{
                address: this.state.host_value,
                category: category,
            }
        })
    }
    changeHostValue = (e) => {
        console.log(e)
        this.setState({
            host_value: e.target.value
        })
    }
    changeCategoryValue = (e) => {
        console.log(e)
        this.setState({
            category_value: e.target.value
        })
    }
    render() {
        return (
        <React.Fragment>
            <div className="col-12">
                <div className="bg-dark text-white rounded p-3 my-4">
                    The Gates To The Hell Proxy
                </div>
                </div>
                <div className="col-3">
                <div className="list-group">
                    {this.state.categories.map((item, index) => (
                        <button className="list-group-item list-group-item-action bg-dark text-white" key={index} onClick={() => {this.setState({selected_category:item.name})}}>
                        {item.name}
                        </button>
                    ))}
                    {/* <a href="#" className="list-group-item list-group-item-action bg-warning text-white">+ Add Category</a> */}
                    <div className="col-auto list-group-item list-group-item-action bg-light text-white">
                        <label className="sr-only" htmlFor="inlineFormInputGroup">Category</label>
                        <div className="input-group mb-2">
                            <input type="text" className="form-control" id="inlineFormInputGroup" placeholder="Category" onChange={this.changeCategoryValue}/>
                            <div className="input-group-postpend">
                            <button 
                            className="btn btn-warning" style={{borderTopLeftRadius:0, borderBottomLeftRadius:0}}
                            onClick={this.addCategory}>
                                Add
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <div className="col-9">
                    <div>
                        <table className="table table-striped table-dark rounded">
                            <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Address</th>
                                <th scope="col">Category</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.ips_list.filter(item=>(item.category === this.state.selected_category)).map((item,index)=> (
                                <tr>
                                    <th scope="row">{index+1}</th>
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                </tr>
                            ))
                            }
                            </tbody>
                        </table>
                        <div className="form-inline row">
                            <div className="form-group mb-2 col-sm-1">
                                <label className="col-form-label">Hostname:</label>
                            </div>
                            <div className="form-group mx-sm-3 mb-2 col-sm-7">
                                <input onChange={this.changeHostValue} className="form-control" id="address" placeholder="Enter hostname" style={{width:'100%'}}/>
                            </div>
                            <button onClick={() => this.addHost(this.state.selected_category)} className="btn btn-primary mb-2 col-sm-3">Add Host</button>
                        </div>
                    </div>
                </div>
        </React.Fragment>
        );
    }
}

export default Home;

