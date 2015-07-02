/** @jsx React.DOM */

SC.GroupPage = React.createClass({
  render: function() {
    var group_tag = this.props.groups.map(function(group){
      return (
        <RB.Label key={group.id} bsStyle='primary'>{group.name}</RB.Label>
      );
    });
    return (
      <RB.Grid>
        <RB.Row>
          <RB.Col><RB.Well>
            <h3>群組</h3><hr/>
            {group_tag}
          </RB.Well></RB.Col>
        </RB.Row>
      </RB.Grid>
    );
  }
});
