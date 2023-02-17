import React from 'react';

import { AnnouncementIcon } from '../../assets/AnnouncementIcon';
import {
  AlertNotificationRow,
  AlertNotificationViewProps,
} from './AlertNotificationRow';

type BroadcastMessageChangedRendererProps = Readonly<{
  createdDate: string;
  message: string | undefined;
  subject: string | undefined;
  notificationTitle: string;
  handleAlertEntrySelection: () => void;
  classNames?: AlertNotificationViewProps['classNames'];
}>;

export const BroadcastMessageChangedRenderer: React.FC<
  BroadcastMessageChangedRendererProps
> = ({
  message,
  subject,
  createdDate,
  notificationTitle,
  handleAlertEntrySelection,
  classNames,
}) => {
  return (
    <AlertNotificationRow
      handleAlertEntrySelection={handleAlertEntrySelection}
      notificationTitle={notificationTitle}
      notificationImage={<AnnouncementIcon />}
      notificationSubject={subject}
      notificationDate={createdDate}
      notificationMessage={message}
      classNames={classNames}
    />
  );
};
