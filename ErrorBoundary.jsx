import {Component} from 'react';
export default class ErrorBoundary extends Component{
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error,info){console.error('Football World 360 UI error',error,info);}
  render(){
    if(this.state.error)return <div className="page"><div className="state error"><h2>Something went wrong</h2><p>{this.state.error?.message||'This page could not be displayed.'}</p><button className="btn" onClick={()=>this.setState({error:null})}>Try again</button></div></div>;
    return this.props.children;
  }
}
