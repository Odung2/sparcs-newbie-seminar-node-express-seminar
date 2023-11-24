import React from "react";
import axios from "axios";
import { SAPIBase } from "../tools/api";
import Header from "../components/header";
import "./css/feed.css";

interface IAPIResponse  { id: number, title: string, content: string }

const FeedPage = (props: {}) => {
  const [ LAPIResponse, setLAPIResponse ] = React.useState<IAPIResponse[]>([]);
  const [ NPostCount, setNPostCount ] = React.useState<number>(0);
  const [ SNewPostTitle, setSNewPostTitle ] = React.useState<string>("");
  const [ SNewPostContent, setSNewPostContent ] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingTitle, setEditingTitle] = React.useState<string>("");
  const [editingContent, setEditingContent] = React.useState<string>("");

  React.useEffect( () => {
    let BComponentExited = false;
    const asyncFun = async () => {
      const { data } = await axios.get<IAPIResponse[]>( SAPIBase + `/feed/getFeed?count=${ NPostCount }`);
      console.log(data);
      // const data = [ { id: 0, title: "test1", content: "Example body" }, { id: 1, title: "test2", content: "Example body" }, { id: 2, title: "test3", content: "Example body" } ].slice(0, NPostCount);
      if (BComponentExited) return;
      setLAPIResponse(data);
    };
    asyncFun().catch((e) => window.alert(`Error while running API Call: ${e}`));
    return () => { BComponentExited = true; }
  }, [ NPostCount ]);

  const createNewPost = () => {
    const asyncFun = async () => {
      await axios.post( SAPIBase + '/feed/addFeed', { title: SNewPostTitle, content: SNewPostContent } );
      setNPostCount(NPostCount + 1);
      setSNewPostTitle("");
      setSNewPostContent("");
    }
    asyncFun().catch(e => window.alert(`AN ERROR OCCURED! ${e}`));
  }

  const deletePost = (id: string) => {
    const asyncFun = async () => {
      // One can set X-HTTP-Method header to DELETE to specify deletion as well
      await axios.post( SAPIBase + '/feed/deleteFeed', { id: id } );
      setNPostCount(Math.max(NPostCount - 1, 0));
    }
    asyncFun().catch(e => window.alert(`AN ERROR OCCURED! ${e}`));
  }

  const startEditing = (post: IAPIResponse) => {
    setEditingId(post.id);
    setEditingTitle(post.title);
    setEditingContent(post.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = async () => {
    if (editingId === null) {
      window.alert("No post is being edited.");
      return;
    }
  
    try {
      const response = await axios.put(SAPIBase + '/feed/editFeed', {
        id: editingId,
        title: editingTitle,
        content: editingContent
      });
  
      if (response.data.isOK) {

        setEditingId(null);
        setEditingTitle("");
        setEditingContent("");
  
      } else {
        window.alert("An error occurred while saving the post.");
      }
    } catch (error) {
      console.error("Error while saving the post:", error);
      window.alert(`An error occurred: ${error}`);
    }
  };
  
  
  return (
    <div className="Feed">
      <Header/>
      <h2>Feed</h2>
      <div className={"feed-length-input"}>
        Number of posts to show: &nbsp;&nbsp;
        <input type={"number"} value={ NPostCount } id={"post-count-input"} min={0}
              onChange={ (e) => setNPostCount( parseInt(e.target.value) ) }
        />
      </div>
      <div className={"feed-list"}>
        { LAPIResponse.map( (val, i) =>
          <div key={i} className={"feed-item"}>
          {editingId === val.id ? (
            <div>
              edited Title: <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} />
              edited Content: <input value={editingContent} onChange={e => setEditingContent(e.target.value)} />
              <button onClick={saveEditing}>Save</button>
              <button onClick={cancelEditing}>Cancel</button>
            </div>
          ) : (
            <div>
              <div className={"delete-item"} onClick={() => deletePost(`${val.id}`)}>ⓧ</div>
              <h3 className={"feed-title"}>{val.title}</h3>
              <p className={"feed-body"}>{val.content}</p>
              <button onClick={() => startEditing(val)}>Edit</button>
            </div>
          )}
        </div>
        ) }
        <div className={"feed-item-add"}>
          Title: <input type={"text"} value={SNewPostTitle} onChange={(e) => setSNewPostTitle(e.target.value)}/>
          &nbsp;&nbsp;&nbsp;&nbsp;
          Content: <input type={"text"} value={SNewPostContent} onChange={(e) => setSNewPostContent(e.target.value)}/>
          <div className={"post-add-button"} onClick={(e) => createNewPost()}>Add Post!</div>
        </div>
      </div>
    </div>
  );
}

export default FeedPage;