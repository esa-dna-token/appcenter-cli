import { AppCommand, CommandArgs, CommandResult, help, failure, ErrorCodes, success, required, position, name } from "../../../util/commandline";
import { MobileCenterClient, models, clientRequest } from "../../../util/apis";
import { out, prompt } from "../../../util/interaction";

const debug = require("debug")("mobile-center-cli:commands:codepush:deployment:remove");

@help("Remove CodePush deployment")
export default class RemoveCodePushDeploymentCommand extends AppCommand {

  @help("Specifies CodePush deployment name to be removed")
  @name("deployment-name")
  @position(0)
  @required
  public deploymentName: string;

  constructor(args: CommandArgs) {
    super(args);
  }

  async run(client: MobileCenterClient): Promise<CommandResult> {
    const app = this.app;

    if (!await prompt.confirm(`Do you really want to delete deployment ${this.deploymentName}?`)) {
      out.text(`Deletion of deployment ${this.deploymentName} was cancelled`);
      return success();
    }

    try {
      debug("Removing CodePush deployment");
      const httpResponse = await out.progress(`Removing CodePush deployment ....`, 
        clientRequest((cb) => client.codePushDeployments.deleteMethod(this.deploymentName, app.ownerName, app.appName, cb)));
    } catch (error) {
      debug(`Failed to remove CodePush deployment`);
      if (error.statusCode === 404) {
        const appNotFoundErrorMsg = `Deployment ${this.deploymentName} does not exist.`;
        return failure(ErrorCodes.NotFound, appNotFoundErrorMsg);
      } else {
        return failure(ErrorCodes.Exception, error.message);
      }
    }

    out.text(`Successfully removed the ${this.deploymentName} deployment for the ${app.ownerName}/${app.appName} app.`);  
    return success();
  }
}