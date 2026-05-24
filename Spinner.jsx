export default function Spinner({ size = 20 }) {
  return <span style={{ display:"inline-block", width:size, height:size, border:"2px solid rgba(26,107,255,0.2)", borderTopColor:"#1a6bff", borderRadius:"50%", animation:"spin .8s linear infinite" }} />;
}
