Template.studyGroupSettings.onCreated(function() {
  let instance = this;
  instance.eligibleMembers = new ReactiveVar(0);
});

Template.studyGroupSettings.onRendered(function() {
  let instance = this;
  instance.autorun(() => {
    const studyGroup = StudyGroups.findOne({ _id: FlowRouter.getParam('studyGroupId')});
    let availableMembers = [];
    if (studyGroup) {
      availableMembers = (studyGroup.members || [])
          .filter(m => m.role !== 'owner')
          .map(m => ({ id: m.id, text: m.name }));
      instance.eligibleMembers.set(availableMembers.length);
    }
    Meteor.setTimeout(function(){
      console.log('members', studyGroup.members, 'availableMembers', availableMembers);
      instance.$('#studyGroupMemberList', availableMembers).select2({
        placeholder: TAPi18n.__("select_new_owner"),
        data: availableMembers
      });
    }, 1500);
  });
});

Template.studyGroupSettings.helpers({
    numEligibleMembers: function() {
      return Template.instance().eligibleMembers.get();
    }
});

Template.studyGroupSettings.events({
  "click #archiveStudyGroup":function (event, template) {

    const studyGroupId = this._id;

    sweetAlert({
        type: 'warning',
        title: TAPi18n.__("delete_hangout_confirm"),
        text: TAPi18n.__("archive_final_warning"),
        cancelButtonText: TAPi18n.__("no_delete_group"),
        confirmButtonText: TAPi18n.__("yes_delete_group"),
        confirmButtonColor: "#d9534f",
        showCancelButton: true,
        closeOnConfirm: true,
      },
      function() {
        // disable confirm button to avoid double (or quick) clicking on confirm event
        swal.disableButtons();
        // if user confirmed/selected yes, let's call the delete hangout method on the server


        Meteor.call("archiveStudyGroup", studyGroupId ,function (error, result) {
          if(error){
            return Bert.alert( error.reason, 'danger', 'growl-top-right' );
          }
          if(result){
            FlowRouter.go("all study groups");
            return Bert.alert( 'Study Group Archived', 'success', 'growl-top-right' );
          }
        })
      });
  },
  "change #hangoutPermission": function (event, template) {


      const data = {
        id: this._id,
        permission: template.find("#hangoutPermission").value == "true" ? true : false
      }

      sweetAlert({
        type: 'warning',
        title: TAPi18n.__("delete_hangout_confirm"),
        cancelButtonText: TAPi18n.__("no_delete_group"),
        confirmButtonText: TAPi18n.__("yes_delete_learning"),
        confirmButtonColor: "#d9534f",
        showCancelButton: true,
        closeOnConfirm: true,
      },
      function() {
        // disable confirm button to avoid double (or quick) clicking on confirm event
        swal.disableButtons();

        Meteor.call("updateHangoutCreationPermission", data ,function (error, result) {
          if(error){
            return Bert.alert( error.reason, 'danger', 'growl-top-right' );
          }
          if(result){
            return Bert.alert( 'Permission updated', 'success', 'growl-top-right' );
          }
        })
      });
  },
  "click #transferStudyGroup":function (event, template) {

    const data = {
      studyGroupId: this._id,
      newOwnerId: template.find("#studyGroupMemberList").value,
      studyGroupTitle: this.title,
      studyGroupSlug: this.slug
    };
    const newOwnerUsername = template.find("#studyGroupMemberList option:selected").text;
    // clear selection
    $("#studyGroupMemberList").val(null).trigger('change');

    sweetAlert({
        type: 'warning',
        title: TAPi18n.__("delete_hangout_confirm"),
        text: TAPi18n.__("transfer_study_group"),
        cancelButtonText: TAPi18n.__("no_transfer_group"),
        confirmButtonText: TAPi18n.__("yes_transfer_group"),
        confirmButtonColor: "#d9534f",
        showCancelButton: true,
        closeOnConfirm: true,
      },
      function() {
        // disable confirm button to avoid double (or quick) clicking on confirm event
        swal.disableButtons();

        Meteor.call("transferStudyGroup", data ,function (error, result) {
          if(error){
            return Bert.alert( error.reason, 'danger', 'growl-top-right' );
          }
          if(result){
            // Select the first tab in the study group
            $('div.study-group-body [role="presentation"] a:first').tab('show');
            return Bert.alert(`Study Group transferred to ${newOwnerUsername}`, 'success', 'growl-top-right' );
          }
        });
      });
  },
});
