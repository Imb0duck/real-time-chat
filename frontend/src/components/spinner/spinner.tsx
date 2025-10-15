import type { JSX } from 'react';
import './spinner.css';

function Spinner(): JSX.Element {
  return(
    <div className='overlay'>
      <p className="spinner">Loading...</p>
    </div>
  );
}

export default Spinner;
