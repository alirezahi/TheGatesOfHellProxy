import React, { Component } from 'react';

class Home extends Component {
    constructor(props){
        super(props)
        this.state = {
            categories:[
                {text:'hello'}
            ],
            category_value: '',
        }
    }
    addCategory = (e) => {
        this.setState(previousState => ({
            categories: [...previousState.categories,{text: this.state.category_value}]
        }))
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
                        <a href="#" className="list-group-item list-group-item-action bg-dark text-white" key={index}>{item.text}</a>
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
                        <th scope="col">First</th>
                        <th scope="col">Last</th>
                        <th scope="col">Handle</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                    </tr>
                    <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td>@fat</td>
                    </tr>
                    <tr>
                        <th scope="row">3</th>
                        <td>Larry</td>
                        <td>the Bird</td>
                        <td>@twitter</td>
                    </tr>
                    </tbody>
                </table>
                </div>
                </div>
        </React.Fragment>
        );
    }
}

export default Home;

