const Img = ({url,caption})=>{
    return (
        <div>
            <img src={url} />
            {caption.length ? <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey ">{caption}</p> : ""}
        </div>
    )
}

const Quote = ({quote,caption})=>{
    return (
        <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
            <p
                className="text-xl leading-10 md:text-2xl"
                dangerouslySetInnerHTML={{__html: quote}}
            />
            {
                caption.length ? <p>{caption}</p> :""
            }
        </div>
    )
}

const List = ({style,items})=>{
    const isChecklist = style == "checklist";
    const ListTag = style == "ordered" ? "ol" : "ul";
    const listClass = isChecklist ? "list-none" : style == "ordered" ? "list-decimal" : "list-disc";

    return(
        <ListTag className={`pl-5 ${listClass}`}>
            {
                items.map((listItem,i)=>{
                    const content = typeof listItem === "string" ? listItem : listItem.content;
                    const nestedItems = typeof listItem === "string" ? [] : listItem.items || [];
                    const isChecked = typeof listItem !== "string" && listItem.meta?.checked;

                    return(
                        <li key={i} className="my-4">
                            {isChecklist ? (
                                <input
                                    type="checkbox"
                                    checked={Boolean(isChecked)}
                                    readOnly
                                    className="mr-2"
                                />
                            ) : null}
                            <span dangerouslySetInnerHTML={{__html:content}} />
                            {nestedItems.length ? <List style="unordered" items={nestedItems} /> : null}
                        </li>
                    )
                })
            }
        </ListTag>
    )
}

const BlogContent = ({block}) => {

    const {type,data} = block

    if(type == "paragraph"){
        return (
            <p dangerouslySetInnerHTML={{__html: data.text}}>
            </p>
        )
    }

    if(type == "header"){
        if(data.level == 3){
            return(
                <h3 className="text-3xl font-bold" dangerouslySetInnerHTML={{__html: data.text}}></h3>
            
        )
        }
        return(
                <h3 className="text-4xl font-bold" dangerouslySetInnerHTML={{__html: data.text}}></h3>
            
        )
    }

    if(type == "image"){
        return (
            <Img url={data.file.url} caption={data.caption} />
        )
    }

    if(type == "quote"){
        return (
            <Quote quote={data.text} caption={data.caption} />
        )
    }

    if(type == "list"){
        return(
            <List style={data.style} items={data.items}/>
        )
    }
    
    
    
}

export default BlogContent