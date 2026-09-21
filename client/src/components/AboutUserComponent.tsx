import { Link } from "react-router-dom"
import { getFullDay } from "../common/date"

interface SocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  github?: string;
  linkedin?: string;
}

interface AboutUserProps {
  bio: string;
  social_links: SocialLinks;
  joinedAt: string;
  className?: string;
}

const AboutUserComponent = ({bio,social_links,joinedAt,className}:AboutUserProps) => {
  return (
    <div className={"md:w-[90%] md:mt-7 " + className }>
        <p className="text-xl  leading-7">{bio.length ? bio : "Nothing to read here."}</p>

        <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
            {
                Object.keys(social_links).map((key)=>{
                    const link = social_links[key]

                    return link ? <Link to={link} key={key} target="_blank"><i className={"fi " + (key != "website" ? "fi-brands-" + key : "fi-rr-globe") + " text-2x hover:text-black"}></i></Link> : " "
                })
            }

        </div>
        <p className="text-xl lea-7 text-dark-grey">Joined On {getFullDay(joinedAt)}</p>
    </div>
  )
}

export default AboutUserComponent