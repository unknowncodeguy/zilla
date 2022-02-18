import Button from "../Button/index";

import './index.css';

const EggBox = (props: any) => {

    const { img, onClick, id, value, lockable, locked, amount } = props
    return (
        <div className="egg-div">
            <div className={lockable? "egg lockable" : "egg"}>
                <img src={img} className="main" alt="drake"/>
                {
                    lockable && 
                    <div className="description">
                        <img src={locked === true ? "lock.png" : "unlock.png"} alt="lock"/>
                        <div className="amount">
                            +{amount} $FIRE
                        </div>
                    </div>
                }
            </div>
            {
                !locked &&
                    <Button value={value} style={{ width: 130, height: 38 }} dark onClick={() => onClick(id)} />
            }
        </div>
    )
}

export default EggBox