const getRequest = data =>
  new Request("http://localhost:4000/graphql", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/graphql"
    },
    body: data
  });

export default {
    requestedSongs: _ => getRequest(`{Pending{id, title, enable}}`),
    allSongs: _ => getRequest(`{Songs{id, title, enable}}`),
    playedSong: id => getRequest(`mutation {
        playedSong(id: "${id}") {
          id
        }
      }`)
};
