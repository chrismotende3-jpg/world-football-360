import {Link,NavLink,Outlet} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
export default function Layout(){
  const {user,profile,signOut}=useAuth();
  return <>
    <header className="top"><Link className="brand" to="/"><span>⚽</span> FOOTBALL WORLD <b>360</b></Link>
      <nav>{[['/','Home'],['/fixtures','Fixtures'],['/standings','Standings'],['/teams','Teams'],['/players','Players'],['/news','News'],['/community','Community'],['/predictions','Predictions'],['/quiz','Quiz'],['/player-of-week','Player of Week'],['/ai','AI']].map(([p,l])=><NavLink key={p} to={p} end={p==='/' }>{l}</NavLink>)}
        {user?<><NavLink to="/messages">Messages</NavLink><NavLink to="/groups">Groups</NavLink><NavLink to="/notifications">Notifications</NavLink><NavLink to="/profile">Profile</NavLink>{profile?.role==='admin'&&<NavLink to="/admin">Admin</NavLink>}<button className="linkbtn" onClick={signOut}>Logout</button></>:<NavLink to="/login">Login</NavLink>}
      </nav>
    </header>
    <main><ErrorBoundary><Outlet/></ErrorBoundary></main>
    <footer>Football World 360 · Live football data, community and analysis</footer>
  </>;
}
