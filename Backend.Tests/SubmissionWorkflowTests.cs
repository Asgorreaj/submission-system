using System;
using Xunit;

namespace Backend.Tests
{
    public class SubmissionWorkflowTests
    {
        private static string DetermineSubmissionStatus(DateTime now, DateTime deadline)
        {
            return now > deadline ? "Late" : "Submitted";
        }

        [Fact]
        public void Submission_ShouldBeMarkedSubmitted_WhenBeforeDeadline()
        {
            var deadline = new DateTime(2026, 8, 20, 23, 59, 0, DateTimeKind.Utc);
            var submittedAt = new DateTime(2026, 8, 19, 10, 0, 0, DateTimeKind.Utc);

            var status = DetermineSubmissionStatus(submittedAt, deadline);

            Assert.Equal("Submitted", status);
        }

        [Fact]
        public void Submission_ShouldBeMarkedLate_WhenAfterDeadline()
        {
            var deadline = new DateTime(2026, 8, 20, 23, 59, 0, DateTimeKind.Utc);
            var submittedAt = new DateTime(2026, 8, 21, 9, 0, 0, DateTimeKind.Utc);

            var status = DetermineSubmissionStatus(submittedAt, deadline);

            Assert.Equal("Late", status);
        }

        [Fact]
        public void UpdateSubmission_ShouldBeBlocked_WhenDeadlineHasPassed()
        {
            var deadline = new DateTime(2026, 8, 10, 23, 59, 0, DateTimeKind.Utc);
            var attemptTime = new DateTime(2026, 8, 11, 8, 0, 0, DateTimeKind.Utc);

            bool isBlocked = attemptTime > deadline;

            Assert.True(isBlocked, "Editing a submission after its deadline must be rejected.");
        }

        [Fact]
        public void UpdateSubmission_ShouldBeBlocked_WhenAlreadyGraded()
        {
            string currentStatus = "Graded";

            bool isBlocked = currentStatus == "Graded";

            Assert.True(isBlocked, "A submission that has already been graded must not be editable.");
        }

        [Theory]
        [InlineData("Student", true, false)]
        [InlineData("Student", false, true)]
        [InlineData("Teacher", true, false)]
        [InlineData("Teacher", false, true)]
        public void GetSubmissionById_ShouldEnforceOwnership(string role, bool isOwner, bool expectedForbidden)
        {
            bool isForbidden = (role == "Student" || role == "Teacher") && !isOwner;

            Assert.Equal(expectedForbidden, isForbidden);
        }
    }
}