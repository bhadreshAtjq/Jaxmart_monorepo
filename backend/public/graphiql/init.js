const fetcher = GraphiQL.createFetcher({
  url: '/graphql',
});
ReactDOM.render(
  React.createElement(GraphiQL, {
    fetcher: fetcher,
    defaultEditorToolsVisibility: true,
  }),
  document.getElementById('graphiql')
);
