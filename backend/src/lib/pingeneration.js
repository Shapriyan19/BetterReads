import {generate,count} from "random-words";

const pingenertation = () =>{
    return (generate({maxLength:3}).concat(count({minLength:3,maxLength:5}).toString()));
}

export default pingenertation;