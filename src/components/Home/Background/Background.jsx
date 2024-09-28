import '/src/components/Home/Background/Background.css'
import video1 from '../../../assets/video1.mp4'
import video2 from '../../../assets/video2.mp4'
import image1 from '../../../assets/image1.jpg'
import image2 from '../../../assets/image2.jpg'
import image3 from '../../../assets/image3.jpg'
import image4 from '../../../assets/image4.jpg'
import image8 from '../../../assets/image8.jpg'
import image9 from '../../../assets/image9.jpg'

const Background = ({playStatus,heroCount}) => {

    if(playStatus) {
        return (
            <video className='background fade-in' autoPlay loop muted>
                <source src={video2} type='video/mp4'></source>
            </video>
        )
    }
    else if (heroCount===0){
        return <img src={image4} className='background fade-in' alt='' />
    }
    else if (heroCount===1){
        return <img src={image3} className='background fade-in' alt='' />
    }
    else if (heroCount===2){
        return <img src={image2} className='background fade-in' alt='' />
    }
}



export default Background