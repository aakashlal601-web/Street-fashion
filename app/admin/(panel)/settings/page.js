import { prisma } from '../../../../lib/prisma';
import SettingsClient from '../../../../components/admin/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await prisma.storeSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  return <SettingsClient initialSettings={settings} />;
}
